/**
 * Security Headers Validator
 * Checks index.html and vercel.json for recommended security headers.
 * 
 * This is a warning-only check — it reports missing headers but doesn't fail the build.
 * It helps the team track which security headers still need to be added.
 * 
 * Usage: node scripts/check-security-headers.js
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

const RECOMMENDED_HEADERS = [
  {
    name: 'Content-Security-Policy',
    description: 'Prevents XSS, data injection, and clickjacking attacks',
    checkIn: ['meta', 'vercel'],
    severity: 'HIGH',
  },
  {
    name: 'X-Content-Type-Options',
    description: 'Prevents MIME type sniffing (set to "nosniff")',
    checkIn: ['vercel'],
    severity: 'MEDIUM',
  },
  {
    name: 'X-Frame-Options',
    description: 'Prevents clickjacking by controlling iframe embedding',
    checkIn: ['vercel', 'meta'],
    severity: 'HIGH',
  },
  {
    name: 'Referrer-Policy',
    description: 'Controls how much referrer information is sent',
    checkIn: ['vercel', 'meta'],
    severity: 'MEDIUM',
  },
  {
    name: 'Permissions-Policy',
    description: 'Controls which browser features the site can use',
    checkIn: ['vercel'],
    severity: 'LOW',
  },
  {
    name: 'Strict-Transport-Security',
    description: 'Forces HTTPS connections (HSTS)',
    checkIn: ['vercel'],
    severity: 'HIGH',
  },
  {
    name: 'X-XSS-Protection',
    description: 'Legacy XSS filter (still useful for older browsers)',
    checkIn: ['vercel', 'meta'],
    severity: 'LOW',
  },
];

function checkIndexHtml() {
  const indexPath = join(ROOT, 'index.html');
  if (!existsSync(indexPath)) return '';
  return readFileSync(indexPath, 'utf-8').toLowerCase();
}

function checkVercelJson() {
  const vercelPath = join(ROOT, 'vercel.json');
  if (!existsSync(vercelPath)) return null;
  try {
    return JSON.parse(readFileSync(vercelPath, 'utf-8'));
  } catch {
    return null;
  }
}

function getVercelHeaders(vercelConfig) {
  if (!vercelConfig || !vercelConfig.headers) return [];
  const allHeaders = [];
  for (const headerBlock of vercelConfig.headers) {
    if (headerBlock.headers) {
      for (const h of headerBlock.headers) {
        allHeaders.push(h.key.toLowerCase());
      }
    }
  }
  return allHeaders;
}

function main() {
  console.log('\n🔒 Security Headers Validation');
  console.log('═'.repeat(60));

  const htmlContent = checkIndexHtml();
  const vercelConfig = checkVercelJson();
  const vercelHeaders = getVercelHeaders(vercelConfig);

  let found = 0;
  let missing = 0;
  const issues = [];

  console.log('\n' + '┌' + '─'.repeat(30) + '┬' + '─'.repeat(10) + '┬' + '─'.repeat(10) + '┬' + '─'.repeat(8) + '┐');
  console.log('│' + ' Header'.padEnd(30) + '│' + ' Severity'.padEnd(10) + '│' + ' In HTML'.padEnd(10) + '│' + ' Vercel'.padEnd(8) + '│');
  console.log('├' + '─'.repeat(30) + '┼' + '─'.repeat(10) + '┼' + '─'.repeat(10) + '┼' + '─'.repeat(8) + '┤');

  for (const header of RECOMMENDED_HEADERS) {
    const headerLower = header.name.toLowerCase();
    
    // Check in HTML meta tags
    const inHtml = header.checkIn.includes('meta') && htmlContent.includes(headerLower);
    
    // Check in vercel.json headers
    const inVercel = header.checkIn.includes('vercel') && vercelHeaders.includes(headerLower);
    
    const isPresent = inHtml || inVercel;
    
    if (isPresent) {
      found++;
    } else {
      missing++;
      issues.push(header);
    }

    const htmlStatus = header.checkIn.includes('meta') ? (inHtml ? '✅' : '❌') : '—';
    const vercelStatus = header.checkIn.includes('vercel') ? (inVercel ? '✅' : '❌') : '—';

    console.log(
      '│' + ` ${header.name}`.padEnd(30) +
      '│' + ` ${header.severity}`.padEnd(10) +
      '│' + ` ${htmlStatus}`.padEnd(10) +
      '│' + ` ${vercelStatus}`.padEnd(8) + '│'
    );
  }

  console.log('└' + '─'.repeat(30) + '┴' + '─'.repeat(10) + '┴' + '─'.repeat(10) + '┴' + '─'.repeat(8) + '┘');

  // CORS check
  console.log('\n🌐 CORS Configuration:');
  if (vercelConfig) {
    const corsHeaders = vercelConfig.headers || [];
    for (const block of corsHeaders) {
      if (block.headers) {
        const corsOrigin = block.headers.find(h => h.key === 'Access-Control-Allow-Origin');
        if (corsOrigin) {
          if (corsOrigin.value === '*') {
            console.log(`   ⚠️  Wildcard CORS (Access-Control-Allow-Origin: *) on "${block.source}"`);
            console.log('      Consider restricting to your domain for production.');
          } else {
            console.log(`   ✅ CORS restricted to: ${corsOrigin.value}`);
          }
        }
      }
    }
  }

  // Summary
  console.log(`\n📊 Found: ${found}/${RECOMMENDED_HEADERS.length} recommended headers`);
  console.log(`📊 Missing: ${missing}/${RECOMMENDED_HEADERS.length}`);

  if (issues.length > 0) {
    const highIssues = issues.filter(i => i.severity === 'HIGH');
    console.log(`\n⚠️  ${issues.length} missing security header(s):`);
    for (const issue of issues) {
      const icon = issue.severity === 'HIGH' ? '🔴' : issue.severity === 'MEDIUM' ? '🟡' : '🟢';
      console.log(`   ${icon} ${issue.name} — ${issue.description}`);
    }

    if (highIssues.length > 0) {
      console.log(`\n🔴 ${highIssues.length} HIGH severity header(s) missing. Strongly recommend adding these.`);
    }
  }

  // This is advisory only — don't fail the pipeline
  console.log('\nℹ️  This check is advisory only and does not block deployment.');
  console.log('   Add missing headers to vercel.json or as <meta> tags in index.html.\n');
}

main();
