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
    organizationId?: string;
    orgRoleId?: string;
    orgRole?: OrgRole;
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
    code?: string;
    icon: string;
    description: string;
    unlocked: boolean;
    color?: string;
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

export interface Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    link?: string;
    createdAt: string;
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
    title?: string; // Alias for name
    description: string;
    progress: number;
    target: number;
    total?: number; // Alias for target
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

// ============================================
// MANAGEMENT API (Leader/Admin)
// ============================================

export async function updateIdeaStatus(id: string, status: string): Promise<any> {
    const response = await fetchWithAuth(`/ideas/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error('Failed to update status');
    return response.json();
}

export async function getManagementRedemptions(): Promise<any[]> {
    const response = await fetchWithAuth('/rewards/management/redemptions');
    if (!response.ok) throw new Error('Failed to get management redemptions');
    return response.json();
}

export async function processRedemption(id: string, data: { status: string; note?: string }): Promise<any> {
    const response = await fetchWithAuth(`/rewards/redemptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to process redemption');
    return response.json();
}

export async function updateUser(id: string, data: { role?: string; teamId?: string; position?: string; isActive?: boolean }): Promise<any> {
    const response = await fetchWithAuth(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
}

// ============================================
// NOTIFICATIONS API
// ============================================

export async function getNotifications(): Promise<Notification[]> {
    const response = await fetchWithAuth('/notifications');
    if (!response.ok) throw new Error('Failed to get notifications');
    return response.json();
}

export async function markNotificationRead(id: string): Promise<void> {
    const response = await fetchWithAuth(`/notifications/${id}/read`, { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to mark read');
}

export async function markAllNotificationsRead(): Promise<void> {
    const response = await fetchWithAuth('/notifications/read-all', { method: 'PATCH' });
    if (!response.ok) throw new Error('Failed to mark all read');
}
// ============================================
// MULTI-TENANCY API
// ============================================

export async function checkDomain(email: string): Promise<{ exists: boolean; organization?: any; domain: string }> {
    const response = await fetch(`${API_BASE}/auth/check-domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error('Failed to check domain');
    return response.json();
}

export async function registerOrg(data: { email: string; password: string; name: string; orgName: string }): Promise<{ token: string; user: User }> {
    const response = await fetch(`${API_BASE}/auth/register-org`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Registration failed');
    }

    const resData = await response.json();
    saveAuth(resData.token, resData.user);
    return resData;
}

export async function joinRequest(data: { email: string; password: string; name: string; orgId: string }): Promise<{ message: string; requestId: string }> {
    const response = await fetch(`${API_BASE}/auth/join-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit join request');
    }

    return response.json();
}

export async function getJoinRequests(): Promise<any[]> {
    const response = await fetchWithAuth('/admin/join-requests');
    if (!response.ok) throw new Error('Failed to fetch join requests');
    return response.json();
}

export async function approveJoinRequest(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/join-requests/${id}/approve`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to approve request');
}

export async function rejectJoinRequest(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/join-requests/${id}/reject`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to reject request');
}

// ============================================
// ADMIN (SUPERADMIN) API
// ============================================

export async function adminGetUsers(): Promise<User[]> {
    const response = await fetchWithAuth('/admin/users');
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
}

export async function adminUpdateUser(id: string, data: any): Promise<User> {
    const response = await fetchWithAuth(`/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
}

export async function adminGetMissions(): Promise<any[]> {
    const response = await fetchWithAuth('/admin/missions');
    if (!response.ok) throw new Error('Failed to fetch missions');
    return response.json();
}

export async function adminCreateMission(data: any): Promise<any> {
    const response = await fetchWithAuth('/admin/missions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create mission');
    return response.json();
}

export async function adminUpdateMission(id: string, data: any): Promise<any> {
    const response = await fetchWithAuth(`/admin/missions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update mission');
    return response.json();
}

export async function adminDeleteMission(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/missions/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete mission');
}

export async function adminGetRewards(): Promise<any[]> {
    const response = await fetchWithAuth('/admin/rewards');
    if (!response.ok) throw new Error('Failed to fetch rewards');
    return response.json();
}

export async function adminCreateReward(data: any): Promise<any> {
    const response = await fetchWithAuth('/admin/rewards', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create reward');
    return response.json();
}

export async function adminUpdateReward(id: string, data: any): Promise<any> {
    const response = await fetchWithAuth(`/admin/rewards/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update reward');
    return response.json();
}

export async function adminDeleteReward(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/rewards/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete reward');
}

export async function adminGetStats(): Promise<any> {
    const response = await fetchWithAuth('/admin/stats');
    if (!response.ok) throw new Error('Failed to fetch system stats');
    return response.json();
}

// ============================================
// ADMIN BADGE MANAGEMENT
// ============================================

export async function adminGetBadges(): Promise<Badge[]> {
    const response = await fetchWithAuth('/admin/badges');
    if (!response.ok) throw new Error('Failed to fetch badges');
    return response.json();
}

export async function adminCreateBadge(data: { name: string; code: string; description: string; iconUrl?: string; criteriaJson?: string }): Promise<Badge> {
    const response = await fetchWithAuth('/admin/badges', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create badge');
    }
    return response.json();
}

export async function adminUpdateBadge(id: string, data: Partial<{ name: string; code: string; description: string; iconUrl?: string; criteriaJson?: string }>): Promise<Badge> {
    const response = await fetchWithAuth(`/admin/badges/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update badge');
    }
    return response.json();
}

export async function adminDeleteBadge(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/badges/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete badge');
}

// ============================================
// ADMIN ROLE & ORG MANAGEMENT
// ============================================

export async function adminGetOrganizations(): Promise<any[]> {
    const response = await fetchWithAuth('/admin/organizations');
    if (!response.ok) throw new Error('Failed to fetch organizations');
    return response.json();
}

export async function adminGetRoles(orgId?: string): Promise<OrgRole[]> {
    const response = await fetchWithAuth(`/admin/roles${orgId ? `?orgId=${orgId}` : ''}`);
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
}

export async function adminCreateRole(data: { name: string; description?: string; organizationId: string }): Promise<OrgRole> {
    const response = await fetchWithAuth('/admin/roles', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create role');
    }
    return response.json();
}

export async function adminUpdateRole(id: string, data: { name?: string; description?: string }): Promise<OrgRole> {
    const response = await fetchWithAuth(`/admin/roles/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update role');
    }
    return response.json();
}

export async function adminDeleteRole(id: string): Promise<void> {
    const response = await fetchWithAuth(`/admin/roles/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete role');
}

// ============================================
// ORGANIZATION & PROFILE API
// ============================================

export async function getOrgRoles(orgId: string): Promise<OrgRole[]> {
    const response = await fetchWithAuth(`/organizations/${orgId}/roles`);
    if (!response.ok) throw new Error('Failed to fetch roles for organization');
    return response.json();
}

export async function updateProfile(data: { orgRoleId?: string; position?: string; name?: string; avatarUrl?: string }): Promise<User> {
    const response = await fetchWithAuth('/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
    }
    const updatedUser = await response.json();
    // Update saved user in localStorage
    localStorage.setItem('kaizenhub_user', JSON.stringify(updatedUser));
    return updatedUser;
}

