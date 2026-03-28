export type UserRole = 'agent' | 'admin';

export interface IUser {
  _id: string;
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode?: string;
  isActive: boolean;
  monthlyAiLimit?: number;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  resetToken?: string;
  resetTokenExpiry?: Date;
}

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode?: string;
  monthlyAiLimit?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateUserInput {
  email: string;
  password: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName?: string;
  agentCode?: string;
  monthlyAiLimit?: number;
}
