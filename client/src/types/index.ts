export type Role = 'CUSTOMER' | 'WORKER' | 'ADMIN';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export type BadgeLevel = 'NONE' | 'BASIC' | 'VERIFIED' | 'PREMIUM';

export type DealStatus = 
  | 'OPEN' 
  | 'QUOTATIONS_RECEIVED' 
  | 'WORKER_SELECTED' 
  | 'IN_PROGRESS' 
  | 'READY_FOR_DELIVERY'
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'DISPUTED';

export type QuotationStatus = 
  | 'PENDING' 
  | 'SHORTLISTED' 
  | 'NEGOTIATING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'EXPIRED' 
  | 'WITHDRAWN';

export type OrderStatus = 
  | 'CREATED' 
  | 'ACCEPTED' 
  | 'IN_PROGRESS' 
  | 'READY_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'COMPLETED' 
  | 'DISPUTED' 
  | 'CANCELLED';

export type MilestoneStatus = 
  | 'PENDING' 
  | 'IN_PROGRESS' 
  | 'WORKER_COMPLETED' 
  | 'CUSTOMER_APPROVED' 
  | 'PAYMENT_RELEASED';

export type EscrowStatus = 
  | 'HELD' 
  | 'RELEASED_TO_WORKER' 
  | 'REFUNDED_TO_CUSTOMER' 
  | 'SPLIT_RESOLVED';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: Role;
  avatarUrl?: string;
  city?: string;
  isBlocked: boolean;
  preferredLanguage?: string;
  createdAt: string;
  workerProfile?: WorkerProfile;
}

export interface WorkerCategoryItem {
  id: string;
  categoryId: string;
  category: Category;
}

export interface PortfolioItem {
  id: string;
  workerId: string;
  title: string;
  description?: string;
  imageUrl: string;
  beforeImageUrl?: string;
  category?: string;
  createdAt: string;
}

export interface KYCDocument {
  id: string;
  workerId: string;
  docType: 'AADHAAR' | 'PAN' | 'TRADE_LICENSE' | 'CERTIFICATE';
  docNumber?: string;
  fileUrl: string;
  status: VerificationStatus;
  adminNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  user?: User;
  tagline?: string;
  bio?: string;
  yearsExperience: number;
  serviceArea: string;
  address?: string;
  lat?: number;
  lng?: number;
  verificationState: VerificationStatus;
  badgeLevel: BadgeLevel;
  rating: number;
  totalReviews: number;
  jobsCompleted: number;
  responseRatePct: number;
  profileCompletePct: number;
  walletBalance: number;
  pendingEscrow: number;
  bankUpiDetails?: string;
  skills?: string;
  categories?: WorkerCategoryItem[];
  portfolioItems?: PortfolioItem[];
  kycDocuments?: KYCDocument[];
  reviewsReceived?: Review[];
  createdAt: string;
}

export interface CategoryField {
  id: string;
  categoryId: string;
  fieldName: string;
  label: string;
  fieldType: 'text' | 'number' | 'dropdown' | 'multiselect' | 'toggle';
  options?: string; // JSON parsed to string[]
  isRequired: boolean;
  placeholder?: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description?: string;
  iconName: string;
  commissionPct: number;
  fields?: CategoryField[];
  workersCount?: number;
}

export interface RequirementImage {
  id: string;
  requirementId: string;
  fileUrl: string;
  fileType: 'IMAGE' | 'PDF' | 'AUDIO';
}

export interface Requirement {
  id: string;
  customerId: string;
  customer?: User;
  categoryId: string;
  category?: Category;
  title: string;
  description: string;
  dynamicValues: string; // JSON string of key-value pairs
  minBudget: number;
  maxBudget: number;
  isNegotiable: boolean;
  city: string;
  address: string;
  lat?: number;
  lng?: number;
  deadline: string;
  urgency: 'NORMAL' | 'URGENT';
  workLocationType: 'ON_SITE' | 'DELIVERY';
  materialsSupplied: boolean;
  installationReq: boolean;
  siteVisitReq: boolean;
  status: DealStatus;
  aiSpecs?: string;
  fraudRiskScore?: number;
  createdAt: string;
  images?: RequirementImage[];
  quotations?: Quotation[];
  quotationsCount?: number;
  orders?: Order[];
}

export interface QuotationItem {
  id: string;
  quotationId: string;
  title: string;
  category: 'MATERIAL' | 'LABOUR' | 'TRANSPORT' | 'TAX';
  amount: number;
}

export interface Quotation {
  id: string;
  requirementId: string;
  requirement?: Requirement;
  workerId: string;
  worker?: WorkerProfile;
  totalPrice: number;
  timelineDays: number;
  warrantyMonths: number;
  deliveryTerms?: string;
  notes?: string;
  status: QuotationStatus;
  counterPrice?: number;
  validUntil?: string;
  aiValueScore?: number;
  items?: QuotationItem[];
  createdAt: string;
}

export interface Milestone {
  id: string;
  orderId: string;
  title: string;
  description?: string;
  amount: number;
  sortOrder: number;
  status: MilestoneStatus;
  photoUrl?: string;
  completedAt?: string;
}

export interface EscrowTransaction {
  id: string;
  orderId: string;
  amountHeld: number;
  status: EscrowStatus;
  heldAt: string;
  releasedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  requirementId: string;
  requirement?: Requirement;
  quotationId: string;
  quotation?: Quotation;
  customerId: string;
  customer?: User;
  workerId: string;
  worker?: WorkerProfile;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  workerNetPay: number;
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  milestones?: Milestone[];
  escrow?: EscrowTransaction;
  delivery?: Delivery;
  review?: Review;
}

export interface Delivery {
  id: string;
  orderId: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED';
  trackingId?: string;
  deliveryProof?: string;
  deliveredAt?: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender?: User;
  text: string;
  translatedText?: string;
  fileUrl?: string;
  isMasked: boolean;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  id: string;
  requirementId?: string;
  requirement?: Requirement;
  customerId: string;
  workerId: string;
  worker?: WorkerProfile;
  customer?: User;
  messages: Message[];
  updatedAt: string;
}

export interface Review {
  id: string;
  orderId: string;
  order?: Order;
  customerId: string;
  customer?: User;
  workerId: string;
  worker?: WorkerProfile;
  ratingQuality: number;
  ratingComm: number;
  ratingTime: number;
  ratingValue: number;
  overallRating: number;
  comment: string;
  photoUrl?: string;
  workerReply?: string;
  createdAt: string;
  editableUntil: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  order?: Order;
  raisedById: string;
  raisedBy?: User;
  reason: string;
  evidenceUrl?: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED_REFUND' | 'RESOLVED_RELEASE' | 'RESOLVED_SPLIT';
  decision?: string;
  refundAmount?: number;
  workerAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'DEAL_UPDATE' | 'NEW_QUOTATION' | 'PAYMENT' | 'ADMIN_ALERT';
  link?: string;
  isRead: boolean;
  createdAt: string;
}
