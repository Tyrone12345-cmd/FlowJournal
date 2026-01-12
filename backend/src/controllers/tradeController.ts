import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { TradeType, TradeDirection, TradeStatus, UserRole } from '../types';

const createTradeSchema = z.object({
  symbol: z.string().min(1),
  type: z.nativeEnum(TradeType),
  direction: z.nativeEnum(TradeDirection),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  entryDate: z.string().datetime(),
  exitDate: z.string().datetime().optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  fees: z.number().default(0),
  strategyId: z.string().uuid().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.nativeEnum(TradeStatus).default(TradeStatus.OPEN),
});

const updateTradeSchema = createTradeSchema.partial();

export const createTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const data = createTradeSchema.parse(req.body);

    // Calculate P&L if trade is closed
    let profitLoss = null;
    let profitLossPercent = null;

    if (data.exitPrice && data.status === TradeStatus.CLOSED) {
      const priceDiff = data.direction === TradeDirection.LONG 
        ? data.exitPrice - data.entryPrice
        : data.entryPrice - data.exitPrice;
      
      profitLoss = (priceDiff * data.quantity) - data.fees;
      profitLossPercent = (priceDiff / data.entryPrice) * 100;
    }

    const result = await query(
      `INSERT INTO trades (
        user_id, symbol, type, direction, entry_price, exit_price, quantity,
        entry_date, exit_date, stop_loss, take_profit, profit_loss, profit_loss_percent,
        fees, strategy_id, notes, tags, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        userId, data.symbol, data.type, data.direction, data.entryPrice,
        data.exitPrice || null, data.quantity, data.entryDate, data.exitDate || null,
        data.stopLoss || null, data.takeProfit || null, profitLoss, profitLossPercent,
        data.fees, data.strategyId || null, data.notes || null, data.tags || null, data.status
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const getTrades = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    
    const { status, page = '1', limit = '50' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let queryText = 'SELECT * FROM trades';
    const params: any[] = [];

    // Non-admin users can only see their own trades
    if (userRole !== UserRole.ADMIN) {
      queryText += ' WHERE user_id = $1';
      params.push(userId);

      if (status) {
        queryText += ' AND status = $2';
        params.push(status);
      }
    } else if (status) {
      queryText += ' WHERE status = $1';
      params.push(status);
    }

    queryText += ' ORDER BY entry_date DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(parseInt(limit as string), offset);

    const result = await query(queryText, params);

    res.json({
      trades: result.rows,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
  } catch (error) {
    next(error);
  }
};

export const getTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let queryText = 'SELECT * FROM trades WHERE id = $1';
    const params: any[] = [id];

    // Non-admin users can only see their own trades
    if (userRole !== UserRole.ADMIN) {
      queryText += ' AND user_id = $2';
      params.push(userId);
    }

    const result = await query(queryText, params);

    if (result.rows.length === 0) {
      throw new AppError('Trade not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const data = updateTradeSchema.parse(req.body);

    // Check if trade exists and user has permission
    let checkQuery = 'SELECT * FROM trades WHERE id = $1';
    const checkParams: any[] = [id];
    
    if (userRole !== UserRole.ADMIN) {
      checkQuery += ' AND user_id = $2';
      checkParams.push(userId);
    }

    const existingTrade = await query(checkQuery, checkParams);

    if (existingTrade.rows.length === 0) {
      throw new AppError('Trade not found', 404);
    }

    const trade = existingTrade.rows[0];

    // Calculate P&L if updating exit price or closing trade
    let profitLoss = trade.profit_loss;
    let profitLossPercent = trade.profit_loss_percent;

    const exitPrice = data.exitPrice || trade.exit_price;
    const status = data.status || trade.status;

    if (exitPrice && status === TradeStatus.CLOSED) {
      const priceDiff = trade.direction === TradeDirection.LONG 
        ? exitPrice - trade.entry_price
        : trade.entry_price - exitPrice;
      
      profitLoss = (priceDiff * trade.quantity) - (data.fees || trade.fees);
      profitLossPercent = (priceDiff / trade.entry_price) * 100;
    }

    const updateFields: string[] = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${snakeKey} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    if (profitLoss !== trade.profit_loss) {
      updateFields.push(`profit_loss = $${paramIndex}`);
      updateValues.push(profitLoss);
      paramIndex++;
      updateFields.push(`profit_loss_percent = $${paramIndex}`);
      updateValues.push(profitLossPercent);
      paramIndex++;
    }

    if (updateFields.length === 0) {
      return res.json(trade);
    }

    updateValues.push(id);
    
    const updateQuery = `
      UPDATE trades 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, updateValues);

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return next(new AppError(error.errors[0].message, 400));
    }
    next(error);
  }
};

export const deleteTrade = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let deleteQuery = 'DELETE FROM trades WHERE id = $1';
    const params: any[] = [id];

    if (userRole !== UserRole.ADMIN) {
      deleteQuery += ' AND user_id = $2';
      params.push(userId);
    }

    deleteQuery += ' RETURNING id';

    const result = await query(deleteQuery, params);

    if (result.rows.length === 0) {
      throw new AppError('Trade not found', 404);
    }

    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTradeStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;

    let queryText = `
      SELECT 
        COUNT(*) as total_trades,
        COUNT(*) FILTER (WHERE status = 'closed') as closed_trades,
        COUNT(*) FILTER (WHERE status = 'open') as open_trades,
        COUNT(*) FILTER (WHERE profit_loss > 0) as winning_trades,
        COUNT(*) FILTER (WHERE profit_loss < 0) as losing_trades,
        COALESCE(SUM(profit_loss), 0) as total_profit_loss,
        COALESCE(AVG(profit_loss) FILTER (WHERE profit_loss > 0), 0) as avg_win,
        COALESCE(AVG(profit_loss) FILTER (WHERE profit_loss < 0), 0) as avg_loss,
        COALESCE(MAX(profit_loss), 0) as best_trade,
        COALESCE(MIN(profit_loss), 0) as worst_trade
      FROM trades
    `;

    const params: any[] = [];
    
    if (userRole !== UserRole.ADMIN) {
      queryText += ' WHERE user_id = $1';
      params.push(userId);
    }

    const result = await query(queryText, params);
    const stats = result.rows[0];

    const winRate = stats.closed_trades > 0 
      ? (stats.winning_trades / stats.closed_trades) * 100 
      : 0;

    res.json({
      totalTrades: parseInt(stats.total_trades),
      closedTrades: parseInt(stats.closed_trades),
      openTrades: parseInt(stats.open_trades),
      winningTrades: parseInt(stats.winning_trades),
      losingTrades: parseInt(stats.losing_trades),
      winRate: parseFloat(winRate.toFixed(2)),
      totalProfitLoss: parseFloat(stats.total_profit_loss),
      avgWin: parseFloat(stats.avg_win),
      avgLoss: parseFloat(stats.avg_loss),
      bestTrade: parseFloat(stats.best_trade),
      worstTrade: parseFloat(stats.worst_trade),
    });
  } catch (error) {
    next(error);
  }
};
