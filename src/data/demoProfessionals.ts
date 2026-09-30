import { PUNCHX_50_CATEGORIES } from './categories';
import { Worker } from '../types';

/**
 * DEMO-ONLY professionals for local/staging testing.
 * Every PunchX service category receives a test professional.
 * All IDs are namespaced with `demo-` and all profiles are test data.
 * These are not real people or production workers.
 */
const DEMO_NAMES = [
  'Amit Das', 'Sourav Ghosh', 'Rajesh Kumar', 'Priya Sen', 'Bikash Paul',
  'Arindam Roy', 'Rohan Dutta', 'Ankit Sharma', 'Sanjay Mondal', 'Kunal Saha',
  'Abhishek Roy', 'Debjit Das', 'Rakesh Singh', 'Suman Ghosh', 'Rahul Pal',
  'Imran Khan', 'Subhajit Bose', 'Anirban Dey', 'Vikash Yadav', 'Manish Gupta',
  'Sourav Pal', 'Tanmoy Ghosh', 'Arnab Sen', 'Rajat Das', 'Deepak Kumar',
  'Sayan Mukherjee', 'Ayan Chakraborty', 'Soumen Das', 'Pratik Roy', 'Nikhil Singh',
  'Abhijit Paul', 'Koushik Dey', 'Debashis Roy', 'Amitava Sen', 'Pritam Ghosh',
  'Joydeep Das', 'Suman Pal', 'Rajib Dutta', 'Sujit Roy', 'Kaushik Ghosh',
  'Partha Sen', 'Bappa Das', 'Tuhin Roy', 'Milan Ghosh', 'Sourav Sen',
  'Ranjit Paul', 'Anupam Das', 'Saptarshi Roy', 'Bibek Ghosh', 'Soumik Dey'
];

const SPECIAL_NAMES: Record<string, string> = {
  electrician: 'Amit Das',
  plumber: 'Sourav Ghosh',
  carpenter: 'Bikash Paul',
  'ac-technician': 'Rajesh Kumar',
  'cleaner-housekeeper': 'Priya Service Team',
};

const BADGES: Worker['proBadge'][] = ['PRO', 'TOP', 'VET', 'AUTHORIZED'];

function makeDemoProfessional(index: number, category: typeof PUNCHX_50_CATEGORIES[number]): Worker {
  const basePrice = Number(category.basePrice || 199);
  const name = SPECIAL_NAMES[category.id] || DEMO_NAMES[index % DEMO_NAMES.length];
  const rating = Number((4.5 + ((index * 7) % 5) / 10).toFixed(1));
  const reviewsCount = 40 + ((index * 37) % 210);
  const completedJobs = 90 + ((index * 83) % 600);
  const visitingFee = Math.max(49, Math.min(149, Math.round(basePrice * 0.25)));

  return {
    id: `demo-${category.id}`,
    name,
    category: category.name,
    categories: [category.name, category.id],
    rating,
    reviewsCount,
    avatar: '',
    proBadge: BADGES[index % BADGES.length],
    price: basePrice,
    visitingFee,
    available: true,
    phone: `900000${String(index + 1).padStart(4, '0')}`,
    address: 'Kolkata, West Bengal',
    area: ['Salt Lake', 'New Town', 'Dum Dum', 'Ballygunge', 'Behala'][index % 5],
    sector: category.name,
    completedJobs,
    distanceKm: Number((1.2 + ((index * 13) % 70) / 10).toFixed(1)),
    identityVerified: true,
    skillVerified: true,
    backgroundChecked: true,
    trainingCertified: index % 3 !== 0,
    insuranceCovered: index % 4 !== 0,
    insuranceAmount: index % 4 !== 0 ? '₹1,00,000' : undefined,
    jobsCompletedCount: completedJobs,
    onTimeRate: `${91 + (index % 8)}%`,
    continuousRating: rating,
  };
}

export const DEMO_PROFESSIONALS: Worker[] = PUNCHX_50_CATEGORIES.map((category, index) =>
  makeDemoProfessional(index, category)
);

/** Stable QA identifiers for demo profiles; not connected to production auth. */
export const DEMO_TEST_ACCOUNTS = DEMO_PROFESSIONALS.map((worker, index) => ({
  id: worker.id,
  role: 'professional' as const,
  name: worker.name,
  category: worker.category,
  index: index + 1,
}));
