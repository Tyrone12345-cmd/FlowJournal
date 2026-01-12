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
