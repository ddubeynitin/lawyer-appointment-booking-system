const Notification = require("../models/notification.model");

const createNotificationPayload = ({
  appointment,
  recipientRole,
  title,
  description = "",
  message,
  type,
  channel = "in_app",
}) => {
  if (!appointment || !recipientRole || !title || !message || !type) {
    throw new Error("Invalid notification payload");
  }

  return {
    appointmentId: appointment._id,
    recipientRole,
    userId: appointment.userId,
    lawyerId: appointment.lawyerId,
    type,
    title,
    description,
    notificationMsg: message,
    channel,
  };
};

const logChannelDispatch = (channel, payload) => {
  const targetLabel = payload.recipientRole === "lawyer" ? "lawyer" : "user";
  console.log(`[notifications][${channel}] queued`, {
    recipientRole: targetLabel,
    appointmentId: payload.appointmentId?.toString?.() || payload.appointmentId,
    title: payload.title,
    description: payload.description,
    timestamp: new Date().toISOString(),
  });
};

const createAppointmentNotifications = async ({
  appointment,
  type,
  userTitle,
  userDescription,
  userMessage,
  lawyerTitle,
  lawyerDescription,
  lawyerMessage,
  channel = "in_app",
}) => {
  const payloads = [
    createNotificationPayload({
      appointment,
      recipientRole: "user",
      title: userTitle,
      description: userDescription,
      message: userMessage,
      type,
      channel,
    }),
    createNotificationPayload({
      appointment,
      recipientRole: "lawyer",
      title: lawyerTitle,
      description: lawyerDescription,
      message: lawyerMessage,
      type,
      channel,
    }),
  ];

  const notifications = await Notification.insertMany(payloads);

  ["email", "sms"].forEach((channelName) => {
    payloads.forEach((payload) => logChannelDispatch(channelName, payload));
  });

  return notifications;
};

const fetchNotificationsByRecipient = async ({ recipientRole, recipientId }) => {
  const filter =
    recipientRole === "lawyer"
      ? { lawyerId: recipientId, recipientRole: "lawyer" }
      : { userId: recipientId, recipientRole: "user" };

  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .lean();
};

const markNotificationAsRead = async ({ notificationId, recipientRole, recipientId }) => {
  const filter =
    recipientRole === "lawyer"
      ? { _id: notificationId, lawyerId: recipientId, recipientRole: "lawyer" }
      : { _id: notificationId, userId: recipientId, recipientRole: "user" };

  return Notification.findOneAndUpdate(filter, { isRead: true }, { new: true }).lean();
};

const markAllNotificationsAsRead = async ({ recipientRole, recipientId }) => {
  const filter =
    recipientRole === "lawyer"
      ? { lawyerId: recipientId, recipientRole: "lawyer", isRead: false }
      : { userId: recipientId, recipientRole: "user", isRead: false };

  return Notification.updateMany(filter, { $set: { isRead: true } });
};

module.exports = {
  createAppointmentNotifications,
  fetchNotificationsByRecipient,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
