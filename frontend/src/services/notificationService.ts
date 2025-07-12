export interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'mention' | 'vote' | 'accept';
  message: string;
  user: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
  read: boolean;
  questionId?: string;
  answerId?: string;
  commentId?: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private notifications: Notification[] = [];

  private constructor() {
    // Initialize with some sample notifications
    this.notifications = [
      {
        id: '1',
        type: 'answer',
        message: 'Sarah Smith answered your question about React hooks',
        user: { name: 'Sarah Smith', avatar: undefined },
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: false,
        questionId: '1'
      },
      {
        id: '2',
        type: 'comment',
        message: 'Emily Chen commented on your answer about TypeScript',
        user: { name: 'Emily Chen', avatar: undefined },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        questionId: '2',
        answerId: '5'
      },
      {
        id: '3',
        type: 'mention',
        message: 'David Wilson mentioned you in a question about Node.js',
        user: { name: 'David Wilson', avatar: undefined },
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        questionId: '3'
      },
      {
        id: '4',
        type: 'vote',
        message: 'Lisa Brown upvoted your answer about Git workflow',
        user: { name: 'Lisa Brown', avatar: undefined },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        read: false,
        questionId: '6',
        answerId: '12'
      },
      {
        id: '5',
        type: 'accept',
        message: 'John Doe accepted your answer as the best solution',
        user: { name: 'John Doe', avatar: undefined },
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        read: false,
        questionId: '1',
        answerId: '8'
      }
    ];
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get unread notifications count
  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  // Add new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false
    };
    this.notifications.unshift(newNotification);
  }

  // Create notification for when someone answers a question
  createAnswerNotification(
    questionId: string,
    questionTitle: string,
    answererName: string,
    answererAvatar?: string
  ): void {
    this.addNotification({
      type: 'answer',
      message: `${answererName} answered your question "${questionTitle}"`,
      user: { name: answererName, avatar: answererAvatar },
      questionId
    });
  }

  // Create notification for when someone comments on an answer
  createCommentNotification(
    questionId: string,
    answerId: string,
    questionTitle: string,
    commenterName: string,
    commenterAvatar?: string
  ): void {
    this.addNotification({
      type: 'comment',
      message: `${commenterName} commented on your answer to "${questionTitle}"`,
      user: { name: commenterName, avatar: commenterAvatar },
      questionId,
      answerId
    });
  }

  // Create notification for when someone mentions a user
  createMentionNotification(
    questionId: string,
    questionTitle: string,
    mentionerName: string,
    mentionerAvatar?: string
  ): void {
    this.addNotification({
      type: 'mention',
      message: `${mentionerName} mentioned you in "${questionTitle}"`,
      user: { name: mentionerName, avatar: mentionerAvatar },
      questionId
    });
  }

  // Create notification for when someone votes on an answer
  createVoteNotification(
    questionId: string,
    answerId: string,
    questionTitle: string,
    voterName: string,
    voterAvatar?: string,
    voteType: 'up' | 'down' = 'up'
  ): void {
    this.addNotification({
      type: 'vote',
      message: `${voterName} ${voteType === 'up' ? 'upvoted' : 'downvoted'} your answer to "${questionTitle}"`,
      user: { name: voterName, avatar: voterAvatar },
      questionId,
      answerId
    });
  }

  // Create notification for when an answer is accepted
  createAcceptNotification(
    questionId: string,
    answerId: string,
    questionTitle: string,
    accepterName: string,
    accepterAvatar?: string
  ): void {
    this.addNotification({
      type: 'accept',
      message: `${accepterName} accepted your answer as the best solution for "${questionTitle}"`,
      user: { name: accepterName, avatar: accepterAvatar },
      questionId,
      answerId
    });
  }

  // Delete notification
  deleteNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications = [];
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance(); 