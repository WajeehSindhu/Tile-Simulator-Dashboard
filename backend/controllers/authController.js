const User = require("../models/User");
const bcrypt = require("bcrypt");

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
