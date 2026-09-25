import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';

export const getUserNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to last 50 for performance
    });
    res.status(200).json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = String(req.params.id);
    const userId = (req as any).user.id;
    
    // Ownership check
    const notification = await prisma.notification.findUnique({
      where: { id }
    });

    if (!notification) {
      res.status(404).json({ error: 'Notification not found' });
      return;
    }
    
    if (notification.userId !== userId) {
      res.status(403).json({ error: 'Unauthorized to modify this notification' });
      return;
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });

    res.status(200).json({ notification: updated });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
