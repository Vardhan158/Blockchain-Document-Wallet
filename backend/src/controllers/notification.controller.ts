import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { dbService } from '../services/db.service';

export const getUserNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Unauthorized' });
    }

    const notifications = await dbService.getNotificationsByUserId(user.id, user.role);
    const unreadCount = notifications.filter(n => !n.read).length;

    return res.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const success = await dbService.markNotificationAsRead(id, user.id);
    if (!success) {
      return res.status(404).json({ message: 'Notification not found or unauthorized' });
    }

    return res.json({ message: 'Notification marked as read' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};
