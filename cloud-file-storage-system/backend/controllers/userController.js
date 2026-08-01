const User = require("../models/User");

const PLAN_STORAGE_LIMITS = {
  free: 1073741824, // 1 GB
  pro: 107374182400, // 100 GB
  enterprise: 1099511627776 // 1 TB
};

async function getMembership(req, res, next) {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      membership: user.membership || {
        plan: "free",
        storageLimitBytes: PLAN_STORAGE_LIMITS.free,
        status: "Active"
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateMembership(req, res, next) {
  try {
    const { plan } = req.body;
    if (!plan || !["free", "pro", "enterprise"].includes(plan)) {
      return res.status(400).json({ message: "Invalid membership plan selected" });
    }

    const storageLimitBytes = PLAN_STORAGE_LIMITS[plan];
    const user = await User.findById(req.user._id);

    user.membership = {
      plan,
      storageLimitBytes,
      status: "Active",
      renewDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    await user.save();

    res.json({
      message: `Membership upgraded to ${plan.toUpperCase()} plan successfully!`,
      membership: user.membership
    });
  } catch (error) {
    next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const { theme, emailNotifications, autoCleanup } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.settings) {
      user.settings = {};
    }

    if (theme && ["light", "dark"].includes(theme)) {
      user.settings.theme = theme;
    }
    if (typeof emailNotifications === "boolean") {
      user.settings.emailNotifications = emailNotifications;
    }
    if (typeof autoCleanup === "boolean") {
      user.settings.autoCleanup = autoCleanup;
    }

    await user.save();

    res.json({
      message: "Settings updated successfully",
      settings: user.settings
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name.trim();
    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(409).json({ message: "Email is already taken by another account" });
        }
        user.email = normalizedEmail;
      }
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        membership: user.membership,
        settings: user.settings
      }
    });
  } catch (error) {
    next(error);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const user = await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMembership,
  updateMembership,
  updateSettings,
  updateProfile,
  changePassword
};
