const express = require('express');
const volleyball = require('volleyball');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const passport = require('passport');
const { Strategy, ExtractJwt } = require('passport-jwt');

const { auth } = require('./routes');
const { User } = require('./models');

const app = express();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Database connected successfully'))
  .catch((error) => console.log(error));

app.use(express.json());
app.use(volleyball);
app.use(helmet());
app.use(cors({ origin: '*' }));


passport.use(
  new Strategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id);
        if (!user) {
          done(new Error('User not found'));
          return;
        }

        done(null, user);
      } catch (error) {
        done(error);
      }
    }
  )
);

app.get('/', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.use('/api/auth', auth);

module.exports = app;