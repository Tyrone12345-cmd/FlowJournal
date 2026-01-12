export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  teamId?: string;
  createdAt: string;
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
  entryDate: string;
  exitDate?: string;
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
  createdAt: string;
  updatedAt: string;
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

export interface TradeStats {
  totalTrades: number;
  closedTrades: number;
  openTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
