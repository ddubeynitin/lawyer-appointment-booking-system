const {
  fetchNotificationsByRecipient,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../services/notification.service");

const getUserNotifications = async (req, res) => {
  try {
    const notifications = await fetchNotificationsByRecipient({
      recipientRole: "user",
      recipientId: req.params.userId,
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLawyerNotifications = async (req, res) => {
  try {
    const notifications = await fetchNotificationsByRecipient({
      recipientRole: "lawyer",
      recipientId: req.params.lawyerId,
    });

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markUserNotificationRead = async (req, res) => {
  try {
    const notification = await markNotificationAsRead({
      notificationId: req.params.notificationId,
      recipientRole: "user",
      recipientId: req.params.userId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markLawyerNotificationRead = async (req, res) => {
  try {
    const notification = await markNotificationAsRead({
      notificationId: req.params.notificationId,
      recipientRole: "lawyer",
      recipientId: req.params.lawyerId,
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markUserNotificationsReadAll = async (req, res) => {
  try {
    await markAllNotificationsAsRead({
      recipientRole: "user",
      recipientId: req.params.userId,
    });

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markLawyerNotificationsReadAll = async (req, res) => {
  try {
    await markAllNotificationsAsRead({
      recipientRole: "lawyer",
      recipientId: req.params.lawyerId,
    });

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUserNotifications,
  getLawyerNotifications,
  markUserNotificationRead,
  markLawyerNotificationRead,
  markUserNotificationsReadAll,
  markLawyerNotificationsReadAll,
};
