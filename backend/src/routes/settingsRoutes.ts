import express from 'express';
import {
  getUserSettings,
  updateUserSettings,
  getTeamSettings,
  updateTeamSettings,
  getAppSettings,
  getAppSettingByKey,
  updateAppSetting,
  createAppSetting
} from '../controllers/settingsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// User Settings Routes
router.get('/user', authenticateToken, getUserSettings);
router.patch('/user', authenticateToken, updateUserSettings);

// Team Settings Routes
router.get('/team', authenticateToken, getTeamSettings);
router.patch('/team', authenticateToken, updateTeamSettings);

// App Settings Routes (admin only for create/update, public for read)
router.get('/app', authenticateToken, getAppSettings);
router.get('/app/:key', authenticateToken, getAppSettingByKey);
router.post('/app', authenticateToken, createAppSetting);
router.patch('/app/:key', authenticateToken, updateAppSetting);

export default router;
