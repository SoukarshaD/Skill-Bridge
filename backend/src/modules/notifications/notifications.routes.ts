import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { 
  getUserNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from './notifications.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllNotificationsAsRead);
router.patch('/:id/read', markNotificationAsRead);

export default router;
