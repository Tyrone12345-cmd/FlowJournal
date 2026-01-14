import { Request, Response } from 'express';
import { pool } from '../config/database';
import { UserSettings, TeamSettings, AppSettings } from '../types';

// User Settings Controllers
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Create default settings if none exist
      const createResult = await pool.query(
        `INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *`,
        [userId]
      );
      return res.json(convertUserSettingsFromDb(createResult.rows[0]));
    }

    res.json(convertUserSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Get user settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const {
      theme,
      language,
      currency,
      timezone,
      defaultRiskPercentage,
      defaultPositionSize,
      enableNotifications,
      profileVisibility,
      shareStatistics,
      defaultChartInterval,
      showTutorial,
      compactMode
    } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (theme !== undefined) {
      updateFields.push(`theme = $${paramCount++}`);
      values.push(theme);
    }
    if (language !== undefined) {
      updateFields.push(`language = $${paramCount++}`);
      values.push(language);
    }
    if (currency !== undefined) {
      updateFields.push(`currency = $${paramCount++}`);
      values.push(currency);
    }
    if (timezone !== undefined) {
      updateFields.push(`timezone = $${paramCount++}`);
      values.push(timezone);
    }
    if (defaultRiskPercentage !== undefined) {
      updateFields.push(`default_risk_percentage = $${paramCount++}`);
      values.push(defaultRiskPercentage);
    }
    if (defaultPositionSize !== undefined) {
      updateFields.push(`default_position_size = $${paramCount++}`);
      values.push(defaultPositionSize);
    }
    if (enableNotifications !== undefined) {
      updateFields.push(`enable_notifications = $${paramCount++}`);
      values.push(enableNotifications);
    }
    if (profileVisibility !== undefined) {
      updateFields.push(`profile_visibility = $${paramCount++}`);
      values.push(profileVisibility);
    }
    if (shareStatistics !== undefined) {
      updateFields.push(`share_statistics = $${paramCount++}`);
      values.push(shareStatistics);
    }
    if (defaultChartInterval !== undefined) {
      updateFields.push(`default_chart_interval = $${paramCount++}`);
      values.push(defaultChartInterval);
    }
    if (showTutorial !== undefined) {
      updateFields.push(`show_tutorial = $${paramCount++}`);
      values.push(showTutorial);
    }
    if (compactMode !== undefined) {
      updateFields.push(`compact_mode = $${paramCount++}`);
      values.push(compactMode);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(userId);

    const result = await pool.query(
      `UPDATE user_settings 
       SET ${updateFields.join(', ')}
       WHERE user_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    res.json(convertUserSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Update user settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Team Settings Controllers
export const getTeamSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    // Get user's team
    const userResult = await pool.query(
      'SELECT team_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.team_id) {
      return res.status(404).json({ message: 'User is not part of a team' });
    }

    const teamId = userResult.rows[0].team_id;

    const result = await pool.query(
      'SELECT * FROM team_settings WHERE team_id = $1',
      [teamId]
    );

    if (result.rows.length === 0) {
      // Create default settings if none exist
      const createResult = await pool.query(
        `INSERT INTO team_settings (team_id) VALUES ($1) RETURNING *`,
        [teamId]
      );
      return res.json(convertTeamSettingsFromDb(createResult.rows[0]));
    }

    res.json(convertTeamSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Get team settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTeamSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Only admins and managers can update team settings
    if (userRole !== 'admin' && userRole !== 'manager') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Get user's team
    const userResult = await pool.query(
      'SELECT team_id FROM users WHERE id = $1',
      [userId]
    );

    if (!userResult.rows[0]?.team_id) {
      return res.status(404).json({ message: 'User is not part of a team' });
    }

    const teamId = userResult.rows[0].team_id;

    const {
      requireApprovalForTrades,
      maxDailyLossLimit,
      maxPositionSize,
      allowedSymbols,
      blockedSymbols,
      weeklyReports,
      monthlyReports,
      reportRecipients
    } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (requireApprovalForTrades !== undefined) {
      updateFields.push(`require_approval_for_trades = $${paramCount++}`);
      values.push(requireApprovalForTrades);
    }
    if (maxDailyLossLimit !== undefined) {
      updateFields.push(`max_daily_loss_limit = $${paramCount++}`);
      values.push(maxDailyLossLimit);
    }
    if (maxPositionSize !== undefined) {
      updateFields.push(`max_position_size = $${paramCount++}`);
      values.push(maxPositionSize);
    }
    if (allowedSymbols !== undefined) {
      updateFields.push(`allowed_symbols = $${paramCount++}`);
      values.push(allowedSymbols);
    }
    if (blockedSymbols !== undefined) {
      updateFields.push(`blocked_symbols = $${paramCount++}`);
      values.push(blockedSymbols);
    }
    if (weeklyReports !== undefined) {
      updateFields.push(`weekly_reports = $${paramCount++}`);
      values.push(weeklyReports);
    }
    if (monthlyReports !== undefined) {
      updateFields.push(`monthly_reports = $${paramCount++}`);
      values.push(monthlyReports);
    }
    if (reportRecipients !== undefined) {
      updateFields.push(`report_recipients = $${paramCount++}`);
      values.push(reportRecipients);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(teamId);

    const result = await pool.query(
      `UPDATE team_settings 
       SET ${updateFields.join(', ')}
       WHERE team_id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    res.json(convertTeamSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Update team settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// App Settings Controllers
export const getAppSettings = async (req: Request, res: Response) => {
  try {
    const { category, publicOnly } = req.query;

    let query = 'SELECT * FROM app_settings';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (category) {
      conditions.push(`category = $${paramCount++}`);
      values.push(category);
    }

    if (publicOnly === 'true') {
      conditions.push(`is_public = true`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(query, values);

    const settings = result.rows.map(convertAppSettingsFromDb);
    res.json(settings);
  } catch (error) {
    console.error('Get app settings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAppSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;

    const result = await pool.query(
      'SELECT * FROM app_settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(convertAppSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Get app setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAppSetting = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    // Only admins can update app settings
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { key } = req.params;
    const { value, category, description, isPublic } = req.body;

    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (value !== undefined) {
      updateFields.push(`value = $${paramCount++}`);
      values.push(value);
    }
    if (category !== undefined) {
      updateFields.push(`category = $${paramCount++}`);
      values.push(category);
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (isPublic !== undefined) {
      updateFields.push(`is_public = $${paramCount++}`);
      values.push(isPublic);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(key);

    const result = await pool.query(
      `UPDATE app_settings 
       SET ${updateFields.join(', ')}
       WHERE key = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(convertAppSettingsFromDb(result.rows[0]));
  } catch (error) {
    console.error('Update app setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createAppSetting = async (req: Request, res: Response) => {
  try {
    const userRole = req.user?.role;

    // Only admins can create app settings
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const { key, value, category, description, isPublic } = req.body;

    if (!key || !value) {
      return res.status(400).json({ message: 'Key and value are required' });
    }

    const result = await pool.query(
      `INSERT INTO app_settings (key, value, category, description, is_public)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [key, value, category, description, isPublic || false]
    );

    res.status(201).json(convertAppSettingsFromDb(result.rows[0]));
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Setting with this key already exists' });
    }
    console.error('Create app setting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper functions to convert database snake_case to camelCase
function convertUserSettingsFromDb(row: any): UserSettings {
  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme,
    language: row.language,
    currency: row.currency,
    timezone: row.timezone,
    defaultRiskPercentage: parseFloat(row.default_risk_percentage),
    defaultPositionSize: row.default_position_size ? parseFloat(row.default_position_size) : undefined,
    enableNotifications: row.enable_notifications,
    profileVisibility: row.profile_visibility,
    shareStatistics: row.share_statistics,
    defaultChartInterval: row.default_chart_interval,
    showTutorial: row.show_tutorial,
    compactMode: row.compact_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function convertTeamSettingsFromDb(row: any): TeamSettings {
  return {
    id: row.id,
    teamId: row.team_id,
    requireApprovalForTrades: row.require_approval_for_trades,
    maxDailyLossLimit: row.max_daily_loss_limit ? parseFloat(row.max_daily_loss_limit) : undefined,
    maxPositionSize: row.max_position_size ? parseFloat(row.max_position_size) : undefined,
    allowedSymbols: row.allowed_symbols,
    blockedSymbols: row.blocked_symbols,
    weeklyReports: row.weekly_reports,
    monthlyReports: row.monthly_reports,
    reportRecipients: row.report_recipients,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function convertAppSettingsFromDb(row: any): AppSettings {
  return {
    id: row.id,
    key: row.key,
    value: row.value,
    category: row.category,
    description: row.description,
    isPublic: row.is_public,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
