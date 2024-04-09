const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are mandatory' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    username: username,
    email: email,
    password: hashedPassword,
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'All fields are mandatory' });
  }

  try {
    const user = await User.findOne({ username });
    // const user = await User.findOne({ username }).select('-password');

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...others } = user._doc;
      const accessToken = jwt.sign(
        {
          id: user._id,
          isAdmin: user.isAdmin,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' }
      );
      res.status(200).json({ ...others, accessToken });
      return;
    }
    res.status(401).json('Email or password is not valid');
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
