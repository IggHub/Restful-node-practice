const express = require('express');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes');
const {connectDb, eraseDbOnSync, User} = require('./api/models');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res, next) => {
  res.send('Hello Root!');
});

app.use('/users', userRoutes.user);


connectDb().then(async () => {
  if(eraseDbOnSync){
    await User.deleteMany({});
  };
  createFakeUsers();

  app.listen(PORT, () => {
    console.log('listening to ', PORT);
  });
});

const createFakeUsers = async () => {
  const password1 = await bcrypt.hash('password1', 10);
  const user1 = new User({
    email: 'user1@gmail.com',
    password: password1
  }); 
  const password2 = await bcrypt.hash('password2', 10);
  const user2 = new User({
    email: 'user2@gmail.com',
    password: password2
  });
  const password3 = await bcrypt.hash('password3', 10);
  const user3 = new User({
    email: 'user3@gmail.com',
    password: password3
  });

  await user1.save();
  await user2.save();
  await user3.save();
};
module.exports = app;
