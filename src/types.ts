export type AppScreen = 
  | 'splash' 
  | 'panel-select'
  | 'auth' 
  | 'otp' 
  | 'worker-signup'
  | 'worker-otp-pass'
  | 'worker-pending-approval'
  | 'home' 
  | 'providers' 
  | 'provider-details' 
  | 'booking' 
  | 'payment' 
  | 'tracking' 
  | 'worker-dashboard' 
  | 'admin-dashboard';

export interface WorkerApplication {
  id: string;
  legalName: string;
  address: string;
  skill: string;
  customSkill?: string;
  experienceYears: string;
  phone: string;
  email: string;
  termsAccepted: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

export type UserRole = 'citizen' | 'worker' | 'authority';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'citizen' | 'worker' | 'admin';
  address?: string;
  phone?: string;
  workerSkill?: string;
  workerExperience?: string;
  workerRating?: number;
  workerCompletedJobs?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Worker {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewsCount: number;
  avatar: string;
  proBadge: 'PRO' | 'TOP' | 'VET';
  price: number;
  available?: boolean;
  phone?: string;
  completedJobs?: number;
  earningsToday?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
}

export interface OrderRecord {
  id: string;
  category: string;
  workerName: string;
  workerAvatar?: string;
  workerRating?: number;
  price: number;
  date: string;
  time?: string;
  status: 'Pending' | 'In-Progress' | 'Done' | 'Cancelled';
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  otpCode?: string;
  issueDescription?: string;
  photoProof?: string;
  isRated?: boolean;
  userRating?: number;
  userBehaviour?: string;
  paymentMethod?: string;
  createdAt?: string;
}

export interface CustomerReview {
  id: string;
  orderId?: string;
  customer: string;
  workerName: string;
  workerId?: string;
  category: string;
  rating: number;
  comment: string;
  punctuality?: string;
  professionalism?: string;
  cleanliness?: string;
  tags?: string[];
  date: string;
  createdAt?: string;
}

export interface BookingDetails {
  date: string; // e.g., "MON 12"
  time: string; // e.g., "11:30 AM"
  address: string;
  description: string;
  uploadedPhoto: string | null;
  baseFee: number;
  visitingFee: number;
  totalCost: number;
  selectedWorker: Worker | null;
  paymentMethod: string;
  paymentStatus: 'pending' | 'success';
}

export interface AiMessage {
  sender: 'user' | 'drago' | 'worker';
  text: string;
  timestamp: string;
}

