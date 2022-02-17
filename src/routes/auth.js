const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const { auth } = require('../middlewares');
const { User } = require('../models');

router.post('/register', async (req, res) => {
    // 1. Створіть нового користувача з унікальним username та зашифрованим паролем
    // 2. Підготуйте payload для генерації jwt токена
    // 3. Згенеруйте jwt токен
  try{
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      req.status(400).json({
        message: 'Username is taken'
      })
      return;
    }
    
    const newUser = await User.create({
      ...req.body,
      password: await bcrypt.hash(req.body.password, 12),
    })

    const payload = {
      id: newUser._id
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '14d',
    })

    res.json({
      user: newUser,
      token: token
    })
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

router.post('/login', async (req, res, next) => {
  try{
    const user = await User.findOne({ username: req.body.username });
    if (user) {
      res.status(400).json({
        message: 'Username is taken'
      })
      return;
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if(!validPassword) {
      res.status(400).json({
        message: 'Wrong data'
      });
      return;
    }

    const payload = {
      id: user._id
    }

    const token = jwt.sign(payload, procces.env.JWT_SECRET, {
      expiresIn: '14d'
    });

    res.json({
      user: user,
      token: token
    })
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
})

router.get('/me', auth, (req, res) => {
  // 1. Забороніть використання роута для неавторизованих користувачів
  // 2. У відповідь передайте дані авторизованого користувача
  const { username } = req.user
  res.json({
    status: 'success',
    code: 200,
    data: {
      message: `Authorization was successful: ${username}`,
    },
  })
  res.json(null);
})

module.exports = router;