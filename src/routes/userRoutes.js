const User = require('../models/userModel');
const {
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require('../controllers/verifyTokenController');
const router = require('express').Router();
const bcrypt = require('bcrypt');

router.put('/:id', verifyTokenAndAuthorization, async (req, res) => {
  const { password } = req.body;
  if (password) req.body.password = await bcrypt.hash(password, 10);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json(err);
  }
});

router.delete('/:id', verifyTokenAndAuthorization, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json(deletedUser);
  } catch (error) {
    res.status(500).json(err);
  }
});

router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(err);
  }
});

router.get('/', verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const user = query
      ? await User.find({}).sort({ _id: -1 }).limit(2).select('-password')
      : await User.find({}).select('-password');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json(err);
  }
});

router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$month',
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
