const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Get token from localStorage
function getToken(): string | null {
    return localStorage.getItem('kaizenhub_token');
}

// Save token and user to localStorage
export function saveAuth(token: string, user: User): void {
    localStorage.setItem('kaizenhub_token', token);
    localStorage.setItem('kaizenhub_user', JSON.stringify(user));
}

// Clear auth data
export function clearAuth(): void {
    localStorage.removeItem('kaizenhub_token');
    localStorage.removeItem('kaizenhub_user');
}

// Check if logged in
export function isLoggedIn(): boolean {
    return !!getToken();
}

// Get saved user
export function getSavedUser(): User | null {
    const userJson = localStorage.getItem('kaizenhub_user');
    return userJson ? JSON.parse(userJson) : null;
}

// Generic fetch with auth
async function fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        clearAuth();
        window.location.hash = '#/login';
    }

    return response;
}

// Types
export interface User {
    id: string;
    email: string;
    name: string;
    avatarUrl: string;
    role: string;
    team?: string;
    position?: string;
    points?: number;
    level?: number;
    nextLevelPoints?: number;
    streak?: number;
    badges?: Badge[];
}

export interface Badge {
    id: string;
    name: string;
    icon: string;
    description: string;
    unlocked: boolean;
}

export interface Idea {
    id: string;
    title: string;
    problem: string;
    proposal: string;
    impact: string;
    status: string;
    votes: number;
    votedBy: string[];
    comments: Comment[];
    author: {
        id: string;
        name: string;
        avatar: string;
        team?: string;
    };
    createdAt: string;
}

export interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    createdAt: string;
}

export interface Kudos {
    id: string;
    sender: { id: string; name: string; avatar: string };
    receiver: { id: string; name: string; avatar: string };
    value: string;
    message: string;
    likes: number;
    likedBy: string[];
    createdAt: string;
}

export interface Reward {
    id: string;
    name: string;
    description: string;
    image: string;
    cost: number;
    type: string;
    stock: number;
}

export interface Mission {
    id: string;
    name: string;
    description: string;
    progress: number;
    target: number;
    reward: number;
    completed: boolean;
    claimed: boolean;
}

export interface Transaction {
    id: string;
    description: string;
    amount: number;
    type: string;
    date: string;
}

// ============================================
// AUTH API
// ============================================

export async function login(email: string, password: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    saveAuth(data.token, data.user);
    return data;
}

export async function register(email: string, password: string, name: string): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    saveAuth(data.token, data.user);
    return data;
}

export async function logout(): Promise<void> {
    await fetchWithAuth('/auth/logout', { method: 'POST' });
    clearAuth();
}

// ============================================
// USER API
// ============================================

export async function getCurrentUser(): Promise<User> {
    const response = await fetchWithAuth('/me/me');
    if (!response.ok) throw new Error('Failed to get user');
    return response.json();
}

export async function getUsers(): Promise<User[]> {
    const response = await fetchWithAuth('/users');
    if (!response.ok) throw new Error('Failed to get users');
    return response.json();
}

// ============================================
// IDEAS API
// ============================================

export async function getIdeas(): Promise<Idea[]> {
    const response = await fetchWithAuth('/ideas');
    if (!response.ok) throw new Error('Failed to get ideas');
    return response.json();
}

export async function getIdea(id: string): Promise<Idea> {
    const response = await fetchWithAuth(`/ideas/${id}`);
    if (!response.ok) throw new Error('Failed to get idea');
    return response.json();
}

export async function createIdea(data: { title: string; problem: string; proposal: string; impact?: string }): Promise<Idea> {
    const response = await fetchWithAuth('/ideas', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create idea');
    return response.json();
}

export async function voteIdea(id: string): Promise<{ voted: boolean }> {
    const response = await fetchWithAuth(`/ideas/${id}/vote`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to vote');
    return response.json();
}

export async function addComment(ideaId: string, text: string): Promise<Comment> {
    const response = await fetchWithAuth(`/ideas/${ideaId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to add comment');
    return response.json();
}

// ============================================
// KUDOS API
// ============================================

export async function getKudos(): Promise<Kudos[]> {
    const response = await fetchWithAuth('/kudos');
    if (!response.ok) throw new Error('Failed to get kudos');
    return response.json();
}

export async function sendKudos(data: { receiverId: string; value: string; message: string }): Promise<Kudos> {
    const response = await fetchWithAuth('/kudos', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to send kudos');
    return response.json();
}

export async function likeKudos(id: string): Promise<{ liked: boolean }> {
    const response = await fetchWithAuth(`/kudos/${id}/like`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to like');
    return response.json();
}

// ============================================
// REWARDS API
// ============================================

export async function getRewards(): Promise<Reward[]> {
    const response = await fetchWithAuth('/rewards');
    if (!response.ok) throw new Error('Failed to get rewards');
    return response.json();
}

export async function redeemReward(id: string): Promise<any> {
    const response = await fetchWithAuth(`/rewards/${id}/redeem`, { method: 'POST' });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to redeem');
    }
    return response.json();
}

export async function getWallet(): Promise<{ balance: number; transactions: Transaction[] }> {
    const response = await fetchWithAuth('/rewards/wallet');
    if (!response.ok) throw new Error('Failed to get wallet');
    return response.json();
}

export async function getRedemptions(): Promise<any[]> {
    const response = await fetchWithAuth('/rewards/redemptions');
    if (!response.ok) throw new Error('Failed to get redemptions');
    return response.json();
}

// ============================================
// MISSIONS API
// ============================================

export async function getMissions(): Promise<Mission[]> {
    const response = await fetchWithAuth('/missions');
    if (!response.ok) throw new Error('Failed to get missions');
    return response.json();
}

export async function claimMission(id: string): Promise<{ pointsAwarded: number }> {
    const response = await fetchWithAuth(`/missions/${id}/claim`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to claim mission');
    return response.json();
}

// ============================================
// LEADERBOARD API
// ============================================

export async function getLeaderboard(period: string = 'month'): Promise<any[]> {
    const response = await fetchWithAuth(`/leaderboard?period=${period}`);
    if (!response.ok) throw new Error('Failed to get leaderboard');
    return response.json();
}

// ============================================
// BADGES API
// ============================================

export async function getBadges(): Promise<Badge[]> {
    const response = await fetchWithAuth('/badges');
    if (!response.ok) throw new Error('Failed to get badges');
    return response.json();
}
