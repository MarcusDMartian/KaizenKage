export interface User {
  id: string;
  name: string;
  avatar: string;
  role: 'Member' | 'Leader' | 'Admin';
  team: string;
  points: number;
  monthlyPoints: number;
  quarterlyPoints: number; // Added for leaderboard filtering
  level: number;
  nextLevelPoints: number;
  streak: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface Mission {
  id: string;
  title: string;
  progress: number;
  total: number;
  reward: number;
  completed: boolean;
  claimed: boolean; // Added to track if points have been collected
  type: 'daily' | 'weekly';
}

export interface KaizenIdea {
  id: string;
  title: string;
  problem: string;
  proposal: string;
  impact: 'Cost' | 'Quality' | 'Speed' | 'Safety';
  status: 'New' | 'In Review' | 'Approved' | 'Implemented';
  votes: number;
  author: User;
  createdAt: string;
}

export interface Kudos {
  id: string;
  sender: User;
  receiver: User;
  coreValue: 'Kaizen' | 'Collaboration' | 'Ownership' | 'Customer First';
  message: string;
  createdAt: string;
  likes: number;
}

export interface Reward {
  id: string;
  name: string;
  image: string;
  cost: number;
  type: 'Voucher' | 'DayOff' | 'Merch';
  stock: number;
}

export interface PointTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'earn' | 'spend';
  date: string;
}