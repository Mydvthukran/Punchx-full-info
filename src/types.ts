export type AppScreen = 
  | 'splash' 
  | 'panel-select'
  | 'auth' 
  | 'otp' 
  | 'customer-setup'
  | 'worker-setup'
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
  | 'admin-dashboard'
  | 'privacy-policy'
  | 'terms-and-conditions';

export interface WorkerApplication {
  id: string;
  legalName: string;
  address: string;
  area?: string;
  sector?: string;
  skill: string;
  customSkill?: string;
  experienceYears: string;
  phone: string;
  email: string;
  visitingFee?: number;
  termsAccepted: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
}

/* Use 'admin' consistently (matches current code usage) */
export type UserRole = 'citizen' | 'worker' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL?: string;
  role: UserRole;
  dob?: string;
  birthdate?: string;
  isProfileCompleted?: boolean;
  address?: string;
  landmark?: string;
  area?: string;
  sector?: string;
  phone?: string;
  visitingFee?: number;
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
  proBadge: 'PRO' | 'TOP' | 'VET' | 'AUTHORIZED';
  price: number;
  visitingFee?: number;
  available?: boolean;
  phone?: string;
  address?: string;
  area?: string;
  sector?: string;
  location?: { lat: number; lng: number };
  areaMatch?: boolean;
  distanceKm?: number;
  completedJobs?: number;
  earningsToday?: number;
}

export type ServiceCategory = {
  id: string;
  name: string;
  icon: string;
};

export interface OrderRecord {
  id: string;
  category: string;
  workerName: string;
  workerAvatar?: string;
  workerRating?: number;
  price: number;
  visitingFee?: number;
  platformCommission?: number;
  gstAmount?: number;
  totalAmountToPay?: number;
  date: string;
  time?: string;
  status: 'Pending' | 'In-Progress' | 'Done' | 'Cancelled';
  customerName?: string;
  customerAddress?: string;
  customerPhone?: string;
  area?: string;
  sector?: string;
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
