const User = require("../models/User");
const bcrypt = require("bcrypt");

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const { _id, userName, role } = user;
    res.status(200).json({
      id: _id,
      email,
      userName,
      role,
      message: "Sign-in successful",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
