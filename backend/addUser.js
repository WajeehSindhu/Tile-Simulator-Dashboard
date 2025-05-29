const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

async function createUser() {
  await mongoose.connect(process.env.MONGO_URL);
  const hashed = await bcrypt.hash('admin123', 10);
  await User.create({
    email: 'wajeeh.hassan@barontechs.com',
    password: hashed,
    userName: 'admin', 
  });
  console.log('User added');
  process.exit();
}

createUser();
