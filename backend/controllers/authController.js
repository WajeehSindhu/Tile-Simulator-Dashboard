const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    // Send user data without sensitive information
    const userData = {
      id: user._id,
      email: user.email,
      userName: user.userName,
      role: user.role || 'admin'
    };

    res.status(200).json({
      ...userData,
      message: "Sign-in successful"
    });
  } catch (error) {
    console.error('Sign in error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const frontendBaseURL = 'https://tile-simulator-dashboard.onrender.com';
    const resetLink = `${frontendBaseURL}/reset-password/${token}`;

    const html = `
     <div style="margin: 20px 10px;">
    <img src="https://tile-simulator-dashboard.onrender.com/Images/logo.png" alt="Sight Logo" style="max-width: 100px; margin-bottom: 5px;" />
    <h3>Password Reset</h3>
    <p>Hello ${user.userName},</p>
    <p>You requested a password reset. Click the button below to set a new password:</p>
    <div style="margin: 20px 0;">
      <a
        href="${resetLink}"
        style="
          padding: 12px 16px;
          font-size: 16px;
          color: white;
          background-color: #bd5b4c;
          text-decoration: none;
          border-radius: 6px;
          font-weight: light;
          font-family: poppins;
        "
      >
        Verify Mail 
      </a>
    </div>
    <p>This link will expire in 15 minutes.</p>
     </div>
  `;

    await sendEmail(user.email, "Password Reset", html);

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
};
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(400).json({ message: "Invalid or expired token" });
  }
};