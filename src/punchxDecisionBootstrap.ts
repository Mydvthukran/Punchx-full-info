import { analyzeServiceRequest, PunchXRequestAnalysis } from './lib/punchxDecisionAI';

const ROOT_ID = 'punchx-smart-decision-ai';

const visible = (element: Element | null) => {
  if (!(element instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
};

const setNativeValue = (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, value: string) => {
  const prototype = Object.getPrototypeOf(element);
  const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
  descriptor?.set?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
};

function findContextInput() {
  const candidates = Array.from(document.querySelectorAll('textarea, input[type="text"], input:not([type])'))
    .filter(visible) as Array<HTMLInputElement | HTMLTextAreaElement>;
  return candidates.find(element => {
    const text = `${element.getAttribute('placeholder') || ''} ${element.getAttribute('aria-label') || ''}`.toLowerCase();
    return text.includes('issue') || text.includes('instruction') || text.includes('problem') || text.includes('search for a service') || text.includes('service or worker');
  }) || candidates.find(element => (element as HTMLInputElement).value.trim().length > 0) || candidates[0];
}

function findServiceSelect() {
  return Array.from(document.querySelectorAll('select')).find(select => visible(select) && Array.from(select.options).some(option => /electric|plumb|clean|washing|refriger|ac/i.test(option.textContent || ''))) as HTMLSelectElement | undefined;
}

function applyAnalysis(analysis: PunchXRequestAnalysis) {
  if (!analysis.category) return false;
  const category = analysis.category.name;
  const selects = Array.from(document.querySelectorAll('select')).filter(visible) as HTMLSelectElement[];
  const serviceSelect = selects.find(select => Array.from(select.options).some(option => {
    const text = (option.textContent || '').toLowerCase();
    return text.includes(category.toLowerCase()) || category.toLowerCase().includes(text);
  })) || findServiceSelect();

  if (serviceSelect) {
    const matching = Array.from(serviceSelect.options).find(option => {
      const text = (option.textContent || '').toLowerCase();
      return text.includes(category.toLowerCase()) || category.toLowerCase().includes(text);
    });
    if (matching) setNativeValue(serviceSelect, matching.value);
  }

  const searchInput = Array.from(document.querySelectorAll('input')).find(input => visible(input) && /search for a service|service or worker/i.test(input.placeholder || '')) as HTMLInputElement | undefined;
  if (searchInput) setNativeValue(searchInput, category);

  const noteInput = Array.from(document.querySelectorAll('textarea')).find(area => visible(area) && /issue|instruction|problem|notes/i.test(`${area.placeholder || ''} ${area.getAttribute('aria-label') || ''}`));
  if (noteInput && analysis.urgency !== 'normal' && !noteInput.value.toLowerCase().includes('urgency')) {
    const urgencyNote = analysis.urgency === 'critical' ? 'CRITICAL urgency detected. ' : 'HIGH urgency detected. ';
    setNativeValue(noteInput, `${urgencyNote}${noteInput.value}`.trim());
  }

  return Boolean(serviceSelect || searchInput || noteInput);
}

function render() {
  if (document.getElementById(ROOT_ID)) return;

  const host = document.createElement('div');
  host.id = ROOT_ID;
  host.innerHTML = `
    <button id="punchx-ai-trigger" type="button" aria-label="Open PunchX Smart AI">✦ Smart AI</button>
    <div id="punchx-ai-panel" hidden>
      <div class="punchx-ai-head"><strong>PunchX Smart Decision AI</strong><button id="punchx-ai-close" type="button">×</button></div>
      <p class="punchx-ai-copy">Fast service routing, intent and urgency analysis. Works locally when the experimental Decisions API is available and falls back safely otherwise.</p>
      <textarea id="punchx-ai-input" rows="3" placeholder="Describe the customer's request..."></textarea>
      <button id="punchx-ai-decide" type="button">Analyze request</button>
      <div id="punchx-ai-result"></div>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #${ROOT_ID}{position:fixed;right:18px;bottom:18px;z-index:2147483000;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    #punchx-ai-trigger{border:1px solid rgba(197,160,89,.55);background:#0b1428;color:#e9c176;border-radius:999px;padding:10px 14px;font-weight:800;font-size:12px;box-shadow:0 12px 35px rgba(0,0,0,.3);cursor:pointer}
    #punchx-ai-panel{width:min(360px,calc(100vw - 32px));margin-bottom:10px;padding:14px;border:1px solid rgba(197,160,89,.4);border-radius:18px;background:#07122a;color:#fff;box-shadow:0 20px 60px rgba(0,0,0,.45)}
    .punchx-ai-head{display:flex;align-items:center;justify-content:space-between;font-size:14px}.punchx-ai-head button{background:none;border:0;color:#9ca3af;font-size:22px;cursor:pointer}.punchx-ai-copy{font-size:11px;line-height:1.5;color:#9ca3af}.punchx-ai-panel textarea{width:100%;box-sizing:border-box;resize:vertical;border:1px solid #334155;border-radius:12px;background:#0b1428;color:#fff;padding:10px;font-size:12px;outline:none}.punchx-ai-panel>button{width:100%;margin-top:8px;border:0;border-radius:12px;background:#c5a059;color:#000;padding:10px;font-weight:800;cursor:pointer}.punchx-ai-result{margin-top:10px;font-size:11px;color:#d1d5db}.punchx-ai-chip{display:inline-block;margin:4px 4px 0 0;padding:4px 7px;border-radius:999px;background:#152342;color:#e9c176}
  `;
  document.head.appendChild(style);
  document.body.appendChild(host);

  const panel = host.querySelector('#punchx-ai-panel') as HTMLDivElement;
  const result = host.querySelector('#punchx-ai-result') as HTMLDivElement;
  const input = host.querySelector('#punchx-ai-input') as HTMLTextAreaElement;

  host.querySelector('#punchx-ai-trigger')?.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    if (!panel.hidden) {
      const contextInput = findContextInput();
      if (contextInput?.value.trim()) input.value = contextInput.value;
      input.focus();
    }
  });
  host.querySelector('#punchx-ai-close')?.addEventListener('click', () => { panel.hidden = true; });
  host.querySelector('#punchx-ai-decide')?.addEventListener('click', async () => {
    const text = input.value.trim();
    if (!text) { result.textContent = 'Describe a request first.'; return; }
    result.textContent = 'Analyzing…';
    const analysis = await analyzeServiceRequest(text);
    const source = analysis.source === 'decisions-api' ? 'Chrome Decisions API' : 'local semantic fallback';
    const confidence = Math.round(analysis.confidence * 100);
    result.innerHTML = `
      <div><strong>${analysis.category?.name || 'Needs clarification'}</strong> · ${confidence}% confidence</div>
      <div style="margin-top:4px">Intent: ${analysis.intent} · Urgency: ${analysis.urgency}</div>
      <div style="margin-top:4px;color:#9ca3af">Engine: ${source}</div>
      <div style="margin-top:7px">${analysis.candidates.map(item => `<span class="punchx-ai-chip">${item.category.name} ${Math.round(item.confidence * 100)}%</span>`).join('')}</div>
      <button id="punchx-ai-apply" type="button" style="margin-top:8px;width:100%;border:1px solid rgba(197,160,89,.5);border-radius:10px;background:#0e1933;color:#e9c176;padding:8px;font-weight:800;cursor:pointer">Apply to current panel</button>
      ${analysis.needsClarification ? '<div style="margin-top:7px;color:#fbbf24">Low confidence — review the suggested category before continuing.</div>' : ''}
    `;
    host.querySelector('#punchx-ai-apply')?.addEventListener('click', () => {
      const applied = applyAnalysis(analysis);
      result.insertAdjacentHTML('beforeend', `<div style="margin-top:7px;color:${applied ? '#34d399' : '#fbbf24'}">${applied ? 'Applied to the visible PunchX panel.' : 'No compatible field found on this screen; use the result manually.'}</div>`);
    }, { once: true });
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render, { once: true });
else render();

const observer = new MutationObserver(() => render());
observer.observe(document.documentElement, { childList: true, subtree: true });
