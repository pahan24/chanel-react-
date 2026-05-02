export enum OrderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum TransactionType {
  REWARD = 'reward',
  ORDER = 'order',
  REFUND = 'refund',
  REFERRAL = 'referral',
  SIGNUP_BONUS = 'signup_bonus'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  coins: number;
  referralCode: string;
  referredBy?: string;
  lastDailyReward?: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Channel {
  id: string;
  userId: string;
  url: string;
  name: string;
  followers: number;
  image: string;
  description: string;
  type: 'channel' | 'post';
  createdAt: string;
}

export interface Package {
  id: string;
  name: string;
  price: number; // daily or flat
  type: 'subscription' | 'post';
  reactions: number;
}

export const SUBSCRIPTION_PACKAGES: Package[] = [
  { id: 'sub-1000', name: '1000 Package', price: 30, type: 'subscription', reactions: 1000 },
  { id: 'sub-2000', name: '2000 Package', price: 50, type: 'subscription', reactions: 2000 },
  { id: 'sub-3000', name: '3000 Package', price: 100, type: 'subscription', reactions: 3000 },
];

export const POST_PACKAGES: Package[] = [
  { id: 'post-500', name: '500 Reactions', price: 3, type: 'post', reactions: 500 },
  { id: 'post-1000', name: '1000 Reactions', price: 6, type: 'post', reactions: 1000 },
  { id: 'post-1500', name: '1500 Reactions', price: 10, type: 'post', reactions: 1500 },
  { id: 'post-2000', name: '2000 Reactions', price: 15, type: 'post', reactions: 2000 },
  { id: 'post-2500', name: '2500 Reactions', price: 20, type: 'post', reactions: 2500 },
  { id: 'post-3000', name: '3000 Reactions', price: 25, type: 'post', reactions: 3000 },
];

export const TIME_WINDOWS = [
  '10 minutes', '30 minutes', '1 hour', '3 hours', '6 hours', '12 hours', '24 hours'
];
