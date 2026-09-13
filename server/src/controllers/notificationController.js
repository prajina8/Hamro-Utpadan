import Notification from "../models/Notification.js";


export const pushNotification = async (io, { recipient, recipientRole, sender, type, product, message }) => {
  const notification = await Notification.create({
    recipient: recipient || null,
    recipientRole: recipientRole || null,
    sender,
    type,
    product: product || null,
    message,
  });

  const populated = await notification.populate([
    { path: "sender", select: "name role" },
    { path: "product", select: "name quantity unit status" },
  ]);

  if (recipient) {
    io.to(`user:${recipient}`).emit("notification", populated);
  } else if (recipientRole) {
    io.to(`role:${recipientRole}`).emit("notification", populated);
  }

  return populated;
};


export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("sender", "name role")
      .populate("product", "name quantity unit status");

    res.json({ notifications });
  } catch (error) {
    res.status(500).json({ message: "Could not fetch notifications", error: error.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: "Could not update notification", error: error.message });
  }
};


export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }], read: false },
      { read: true }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Could not update notifications", error: error.message });
  }
};
