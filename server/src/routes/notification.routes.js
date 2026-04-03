const express = require("express");
const router = express.Router();
const {
  getUserNotifications,
  getLawyerNotifications,
  markUserNotificationRead,
  markLawyerNotificationRead,
  markUserNotificationsReadAll,
  markLawyerNotificationsReadAll,
} = require("../controllers/notification.controller");

router.get("/user/:userId", getUserNotifications);
router.get("/lawyer/:lawyerId", getLawyerNotifications);

router.put("/user/:userId/read-all", markUserNotificationsReadAll);
router.put("/lawyer/:lawyerId/read-all", markLawyerNotificationsReadAll);

router.put("/user/:userId/:notificationId/read", markUserNotificationRead);
router.put("/lawyer/:lawyerId/:notificationId/read", markLawyerNotificationRead);

module.exports = router;
