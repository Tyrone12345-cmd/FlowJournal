export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  TRADER = 'trader',
  VIEWER = 'viewer'
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: TradeType;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryDate: Date;
  exitDate?: Date;
  stopLoss?: number;
  takeProfit?: number;
  profitLoss?: number;
  profitLossPercent?: number;
  fees: number;
  strategyId?: string;
  notes?: string;
  tags?: string[];
  screenshots?: string[];
  status: TradeStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum TradeType {
  STOCK = 'stock',
  FOREX = 'forex',
  CRYPTO = 'crypto',
  OPTIONS = 'options',
  FUTURES = 'futures'
}

export enum TradeDirection {
  LONG = 'long',
  SHORT = 'short'
}

export enum TradeStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  CANCELLED = 'cancelled'
}

export interface Strategy {
  id: string;
  userId: string;
  name: string;
  description?: string;
  rules?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface UserSettings {
  id: string;
  userId: string;
  theme: string;
  language: string;
  currency: string;
  timezone: string;
  defaultRiskPercentage: number;
  defaultPositionSize?: number;
  enableNotifications: boolean;
  profileVisibility: string;
  shareStatistics: boolean;
  defaultChartInterval: string;
  showTutorial: boolean;
  compactMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamSettings {
  id: string;
  teamId: string;
  requireApprovalForTrades: boolean;
  maxDailyLossLimit?: number;
  maxPositionSize?: number;
  allowedSymbols?: string[];
  blockedSymbols?: string[];
  weeklyReports: boolean;
  monthlyReports: boolean;
  reportRecipients?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  category?: string;
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
