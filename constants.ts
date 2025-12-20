import { User, Mission, KaizenIdea, Kudos, Reward, PointTransaction, Badge } from './types';

export const MOCK_BADGES: Badge[] = [
  { id: 'b1', name: 'Early Bird', icon: '🌅', color: 'bg-yellow-100 text-yellow-600', description: 'Complete a mission before 9 AM.' },
  { id: 'b2', name: 'Idea Machine', icon: '💡', color: 'bg-blue-100 text-blue-600', description: 'Submit 5 Kaizen ideas.' },
  { id: 'b3', name: 'Kudos Star', icon: '⭐', color: 'bg-purple-100 text-purple-600', description: 'Receive 10 Kudos from colleagues.' },
  { id: 'b4', name: 'Top Performer', icon: '🏆', color: 'bg-amber-100 text-amber-600', description: 'Reach top 3 on the monthly leaderboard.' },
  { id: 'b5', name: 'Bug Hunter', icon: '🐞', color: 'bg-red-100 text-red-600', description: 'Report or fix 5 technical issues.' },
  { id: 'b6', name: 'Team Player', icon: '🤝', color: 'bg-emerald-100 text-emerald-600', description: 'Send 20 Kudos to your teammates.' },
  { id: 'b7', name: 'Streak Master', icon: '🔥', color: 'bg-orange-100 text-orange-600', description: 'Maintain a 30-day activity streak.' },
  { id: 'b8', name: 'Innovator', icon: '🚀', color: 'bg-indigo-100 text-indigo-600', description: 'Have 3 ideas implemented.' },
];

export const CURRENT_USER: User = {
  id: 'u1',
  name: 'Alex Nguyen',
  avatar: 'https://picsum.photos/seed/alex/150/150',
  role: 'Member',
  team: 'Product Design',
  points: 1250,
  monthlyPoints: 350,
  quarterlyPoints: 850,
  level: 5,
  nextLevelPoints: 2000,
  streak: 12,
  badges: [
    MOCK_BADGES[0], // Early Bird
    MOCK_BADGES[1], // Idea Machine
  ]
};

export const MOCK_USERS: User[] = [
  CURRENT_USER,
  {
    id: 'u2',
    name: 'Sarah Le',
    avatar: 'https://picsum.photos/seed/sarah/150/150',
    role: 'Member',
    team: 'Marketing',
    points: 1450,
    monthlyPoints: 420,
    quarterlyPoints: 900,
    level: 6,
    nextLevelPoints: 2500,
    streak: 5,
    badges: [MOCK_BADGES[2]] // Kudos Star
  },
  {
    id: 'u3',
    name: 'Mike Tran',
    avatar: 'https://picsum.photos/seed/mike/150/150',
    role: 'Leader',
    team: 'Engineering',
    points: 980,
    monthlyPoints: 150,
    quarterlyPoints: 400,
    level: 4,
    nextLevelPoints: 1200,
    streak: 2,
    badges: []
  },
  {
    id: 'u4',
    name: 'Jenny Pham',
    avatar: 'https://picsum.photos/seed/jenny/150/150',
    role: 'Member',
    team: 'Sales',
    points: 2100,
    monthlyPoints: 550,
    quarterlyPoints: 1200,
    level: 7,
    nextLevelPoints: 3000,
    streak: 20,
    badges: [
      MOCK_BADGES[3], // Top Performer
      MOCK_BADGES[0]  // Early Bird
    ]
  },
  {
    id: 'u5',
    name: 'David Vo',
    avatar: 'https://picsum.photos/seed/david/150/150',
    role: 'Member',
    team: 'Product Design',
    points: 1100,
    monthlyPoints: 280,
    quarterlyPoints: 750,
    level: 5,
    nextLevelPoints: 2000,
    streak: 8,
    badges: []
  },
  {
    id: 'u6',
    name: 'Linda Kim',
    avatar: 'https://picsum.photos/seed/linda/150/150',
    role: 'Member',
    team: 'HR',
    points: 850,
    monthlyPoints: 120,
    quarterlyPoints: 300,
    level: 3,
    nextLevelPoints: 1000,
    streak: 1,
    badges: []
  },
  {
    id: 'u7',
    name: 'Tom Chen',
    avatar: 'https://picsum.photos/seed/tom/150/150',
    role: 'Leader',
    team: 'Engineering',
    points: 1600,
    monthlyPoints: 300,
    quarterlyPoints: 800,
    level: 6,
    nextLevelPoints: 2500,
    streak: 15,
    badges: [MOCK_BADGES[4]] // Bug Hunter
  },
  {
    id: 'u8',
    name: 'Rachel Green',
    avatar: 'https://picsum.photos/seed/rachel/150/150',
    role: 'Member',
    team: 'Marketing',
    points: 1320,
    monthlyPoints: 390,
    quarterlyPoints: 850,
    level: 5,
    nextLevelPoints: 2000,
    streak: 10,
    badges: []
  }
];

export const MOCK_MISSIONS: Mission[] = [
  { id: 'm1', title: 'Submit 1 Kaizen Idea', progress: 0, total: 1, reward: 50, completed: false, claimed: false, type: 'daily' },
  { id: 'm2', title: 'Send 2 Kudos', progress: 2, total: 2, reward: 30, completed: true, claimed: false, type: 'daily' },
  { id: 'm3', title: 'Complete Profile', progress: 1, total: 1, reward: 100, completed: true, claimed: true, type: 'weekly' },
  { id: 'm4', title: 'Vote on 3 Ideas', progress: 1, total: 3, reward: 20, completed: false, claimed: false, type: 'daily' },
];

export const MOCK_IDEAS: KaizenIdea[] = [
  {
    id: 'k1',
    title: 'Automate Weekly Report',
    problem: 'We spend 2 hours every Friday manually compiling Excel sheets.',
    proposal: 'Use a Python script or Zapier to pull data from Jira to Sheets automatically.',
    impact: 'Speed',
    status: 'In Review',
    votes: 15,
    author: CURRENT_USER,
    createdAt: '2 hours ago',
  },
  {
    id: 'k2',
    title: 'Recycling Bins in Pantry',
    problem: 'Too much plastic waste goes into general trash.',
    proposal: 'Add clearly labeled bins for plastic and cans.',
    impact: 'Quality',
    status: 'New',
    votes: 8,
    author: { ...CURRENT_USER, name: 'Sarah Le', id: 'u2', avatar: 'https://picsum.photos/seed/sarah/150/150' },
    createdAt: '5 hours ago',
  },
  {
    id: 'k3',
    title: 'Optimize Image Assets',
    problem: 'Website load time is slow due to large PNGs.',
    proposal: 'Implement a WebP conversion pipeline in the CI/CD.',
    impact: 'Quality',
    status: 'Implemented',
    votes: 42,
    author: { ...CURRENT_USER, name: 'Mike Tran', id: 'u3', avatar: 'https://picsum.photos/seed/mike/150/150' },
    createdAt: '2 days ago',
  },
];

export const MOCK_KUDOS: Kudos[] = [
  {
    id: 'ku1',
    sender: { ...CURRENT_USER, name: 'Jenny Pham', id: 'u4', avatar: 'https://picsum.photos/seed/jenny/150/150' },
    receiver: CURRENT_USER,
    coreValue: 'Collaboration',
    message: 'Thanks for helping me debug that tricky CSS issue yesterday! You are a lifesaver.',
    createdAt: '10 mins ago',
    likes: 5,
  },
  {
    id: 'ku2',
    sender: CURRENT_USER,
    receiver: { ...CURRENT_USER, name: 'David Vo', id: 'u5', avatar: 'https://picsum.photos/seed/david/150/150' },
    coreValue: 'Ownership',
    message: 'Great job taking lead on the client presentation. It went super smooth.',
    createdAt: '1 hour ago',
    likes: 12,
  },
];

export const MOCK_REWARDS: Reward[] = [
  { id: 'r1', name: 'Coffee Voucher', image: 'https://picsum.photos/seed/coffee/300/200', cost: 500, type: 'Voucher', stock: 50 },
  { id: 'r2', name: 'Grab Gift Card', image: 'https://picsum.photos/seed/grab/300/200', cost: 1000, type: 'Voucher', stock: 20 },
  { id: 'r3', name: 'Company T-Shirt', image: 'https://picsum.photos/seed/shirt/300/200', cost: 1500, type: 'Merch', stock: 10 },
  { id: 'r4', name: 'Half Day Off', image: 'https://picsum.photos/seed/relax/300/200', cost: 5000, type: 'DayOff', stock: 5 },
];

export const MOCK_TRANSACTIONS: PointTransaction[] = [
  { id: 't1', description: 'Submitted Kaizen Idea: "Automate Weekly Report"', amount: 50, type: 'earn', date: 'Today' },
  { id: 't2', description: 'Received Kudos from Jenny Pham', amount: 20, type: 'earn', date: 'Yesterday' },
  { id: 't3', description: 'Redeemed Coffee Voucher', amount: -500, type: 'spend', date: '2 days ago' },
  { id: 't4', description: 'Daily Streak Bonus', amount: 10, type: 'earn', date: '3 days ago' },
  { id: 't5', description: 'Completed Mission: Send 2 Kudos', amount: 30, type: 'earn', date: 'Last Week' },
];