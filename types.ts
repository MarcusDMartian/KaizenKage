// Aligned with backend API types from apiService.ts

export interface User {
  id: string;
  email?: string;
  name: string;
  avatarUrl?: string;
  avatar?: string; // Legacy alias for avatarUrl
  role: string;
  organizationId?: string;
  orgRoleId?: string;
  orgRole?: OrgRole;
  team?: any; // Can be string or Team object
  position?: string;
  points?: number;
  monthlyPoints?: number;
  quarterlyPoints?: number;
  level?: number;
  nextLevelPoints?: number;
  streak?: number;
  isActive?: boolean;
  badges?: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color?: string;
  description: string;
}

export interface OrgRole {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  _count?: {
    users: number;
  };
}

export interface Mission {
  id: string;
  name?: string;
  title?: string; // Legacy alias for name
  description?: string;
  progress: number;
  target?: number;
  total?: number; // Legacy alias for target
  reward: number;
  completed: boolean;
  claimed: boolean;
  type?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface KaizenIdea {
  id: string;
  title: string;
  problem: string;
  proposal: string;
  impact: string;
  status: string;
  votes: number;
  votedBy?: string[];
  followedBy?: string[];
  comments?: Comment[];
  author: {
    id: string;
    name: string;
    avatar?: string;
    avatarUrl?: string;
    team?: string;
  };
  createdAt: string;
}

export interface Kudos {
  id: string;
  sender: {
    id: string;
    name: string;
    avatarUrl?: string;
    avatar?: string;
    team?: string;
  };
  receiver: {
    id: string;
    name: string;
    avatarUrl?: string;
    avatar?: string;
    team?: string;
  };
  coreValue?: string;
  value?: string;
  message: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
}

export interface Reward {
  id: string;
  name: string;
  image?: string;
  imageUrl?: string;
  description?: string;
  cost?: number;
  pointsCost?: number;
  type: string;
  stock: number;
}

export interface PointTransaction {
  id: string;
  description: string;
  amount: number;
  type: string;
  date: string;
}

export interface RedemptionRequest {
  id: string;
  rewardId: string;
  rewardName: string;
  rewardImage?: string;
  pointsCost: number;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

// Type alias for Transaction from API
export type Transaction = PointTransaction;