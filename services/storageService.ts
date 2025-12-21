import { KaizenIdea, Kudos, Reward, PointTransaction, User, Mission, RedemptionRequest } from '../types';
import { MOCK_IDEAS, MOCK_KUDOS, MOCK_REWARDS, MOCK_TRANSACTIONS, MOCK_MISSIONS, CURRENT_USER, MOCK_USERS } from '../constants';

const STORAGE_KEYS = {
  IDEAS: 'kaizenhub_ideas',
  KUDOS: 'kaizenhub_kudos',
  REWARDS: 'kaizenhub_rewards',
  TRANSACTIONS: 'kaizenhub_transactions',
  MISSIONS: 'kaizenhub_missions',
  CURRENT_USER: 'kaizenhub_current_user',
  USERS: 'kaizenhub_users',
  REDEMPTIONS: 'kaizenhub_redemptions',
  THEME: 'kaizenhub_theme',
  ONBOARDING_COMPLETED: 'kaizenhub_onboarding_completed',
  INITIALIZED: 'kaizenhub_initialized',
};

// Initialize storage with mock data if not exists
export const initializeStorage = (): void => {
  const initialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!initialized) {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(MOCK_IDEAS));
    localStorage.setItem(STORAGE_KEYS.KUDOS, JSON.stringify(MOCK_KUDOS));
    localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(MOCK_REWARDS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(MOCK_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(MOCK_MISSIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(CURRENT_USER));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_USERS));
    localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Reset storage to initial state
export const resetStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  initializeStorage();
};

// ============ IDEAS ============
export const getIdeas = (): KaizenIdea[] => {
  const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
  return data ? JSON.parse(data) : MOCK_IDEAS;
};

export const saveIdeas = (ideas: KaizenIdea[]): void => {
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
};

export const getIdeaById = (id: string): KaizenIdea | undefined => {
  const ideas = getIdeas();
  return ideas.find(idea => idea.id === id);
};

export const addIdea = (idea: KaizenIdea): void => {
  const ideas = getIdeas();
  ideas.unshift(idea);
  saveIdeas(ideas);
};

export const updateIdea = (id: string, updates: Partial<KaizenIdea>): void => {
  const ideas = getIdeas();
  const index = ideas.findIndex(idea => idea.id === id);
  if (index !== -1) {
    ideas[index] = { ...ideas[index], ...updates };
    saveIdeas(ideas);
  }
};

export const voteIdea = (ideaId: string, userId: string): boolean => {
  const ideas = getIdeas();
  const idea = ideas.find(i => i.id === ideaId);
  if (!idea) return false;
  
  const votedBy = idea.votedBy || [];
  if (votedBy.includes(userId)) {
    // Already voted, remove vote
    idea.votedBy = votedBy.filter(id => id !== userId);
    idea.votes = Math.max(0, idea.votes - 1);
  } else {
    // Add vote
    idea.votedBy = [...votedBy, userId];
    idea.votes += 1;
  }
  saveIdeas(ideas);
  return !votedBy.includes(userId);
};

export const addComment = (ideaId: string, comment: { id: string; userId: string; userName: string; userAvatar: string; text: string; createdAt: string }): void => {
  const ideas = getIdeas();
  const idea = ideas.find(i => i.id === ideaId);
  if (idea) {
    idea.comments = idea.comments || [];
    idea.comments.push(comment);
    saveIdeas(ideas);
  }
};

export const toggleFollowIdea = (ideaId: string, userId: string): boolean => {
  const ideas = getIdeas();
  const idea = ideas.find(i => i.id === ideaId);
  if (!idea) return false;
  
  const followedBy = idea.followedBy || [];
  if (followedBy.includes(userId)) {
    idea.followedBy = followedBy.filter(id => id !== userId);
  } else {
    idea.followedBy = [...followedBy, userId];
  }
  saveIdeas(ideas);
  return !followedBy.includes(userId);
};

// ============ KUDOS ============
export const getKudos = (): Kudos[] => {
  const data = localStorage.getItem(STORAGE_KEYS.KUDOS);
  return data ? JSON.parse(data) : MOCK_KUDOS;
};

export const saveKudos = (kudos: Kudos[]): void => {
  localStorage.setItem(STORAGE_KEYS.KUDOS, JSON.stringify(kudos));
};

export const addKudos = (kudos: Kudos): void => {
  const allKudos = getKudos();
  allKudos.unshift(kudos);
  saveKudos(allKudos);
};

export const likeKudos = (kudosId: string, userId: string): boolean => {
  const allKudos = getKudos();
  const kudos = allKudos.find(k => k.id === kudosId);
  if (!kudos) return false;
  
  const likedBy = kudos.likedBy || [];
  if (likedBy.includes(userId)) {
    kudos.likedBy = likedBy.filter(id => id !== userId);
    kudos.likes = Math.max(0, kudos.likes - 1);
  } else {
    kudos.likedBy = [...likedBy, userId];
    kudos.likes += 1;
  }
  saveKudos(allKudos);
  return !likedBy.includes(userId);
};

// ============ REWARDS ============
export const getRewards = (): Reward[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REWARDS);
  return data ? JSON.parse(data) : MOCK_REWARDS;
};

export const saveRewards = (rewards: Reward[]): void => {
  localStorage.setItem(STORAGE_KEYS.REWARDS, JSON.stringify(rewards));
};

export const updateRewardStock = (rewardId: string, newStock: number): void => {
  const rewards = getRewards();
  const reward = rewards.find(r => r.id === rewardId);
  if (reward) {
    reward.stock = newStock;
    saveRewards(rewards);
  }
};

// ============ TRANSACTIONS ============
export const getTransactions = (): PointTransaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return data ? JSON.parse(data) : MOCK_TRANSACTIONS;
};

export const saveTransactions = (transactions: PointTransaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const addTransaction = (transaction: PointTransaction): void => {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
};

// ============ MISSIONS ============
export const getMissions = (): Mission[] => {
  const data = localStorage.getItem(STORAGE_KEYS.MISSIONS);
  return data ? JSON.parse(data) : MOCK_MISSIONS;
};

export const saveMissions = (missions: Mission[]): void => {
  localStorage.setItem(STORAGE_KEYS.MISSIONS, JSON.stringify(missions));
};

export const updateMission = (missionId: string, updates: Partial<Mission>): void => {
  const missions = getMissions();
  const index = missions.findIndex(m => m.id === missionId);
  if (index !== -1) {
    missions[index] = { ...missions[index], ...updates };
    saveMissions(missions);
  }
};

// ============ USER ============
export const getCurrentUser = (): User => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return data ? JSON.parse(data) : CURRENT_USER;
};

export const saveCurrentUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const updateUserPoints = (pointsChange: number): User => {
  const user = getCurrentUser();
  user.points += pointsChange;
  if (pointsChange > 0) {
    user.monthlyPoints += pointsChange;
    user.quarterlyPoints += pointsChange;
  }
  saveCurrentUser(user);
  return user;
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(STORAGE_KEYS.USERS);
  return data ? JSON.parse(data) : MOCK_USERS;
};

// ============ REDEMPTIONS ============
export const getRedemptions = (): RedemptionRequest[] => {
  const data = localStorage.getItem(STORAGE_KEYS.REDEMPTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveRedemptions = (redemptions: RedemptionRequest[]): void => {
  localStorage.setItem(STORAGE_KEYS.REDEMPTIONS, JSON.stringify(redemptions));
};

export const addRedemption = (redemption: RedemptionRequest): void => {
  const redemptions = getRedemptions();
  redemptions.unshift(redemption);
  saveRedemptions(redemptions);
};

// ============ THEME ============
export const getTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem(STORAGE_KEYS.THEME);
  return (theme as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark'): void => {
  localStorage.setItem(STORAGE_KEYS.THEME, theme);
};

// ============ ONBOARDING ============
export const isOnboardingCompleted = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === 'true';
};

export const setOnboardingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
};

// Generate unique ID
export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
