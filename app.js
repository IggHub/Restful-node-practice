const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./api/routes');
const {connectDb, eraseDbOnSync, user} = require('./api/models');

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
    await user.deleteMany({});
  };
  createFakeUsers();

  app.listen(PORT, () => {
    console.log('listening to ', PORT);
  });
});

const createFakeUsers = async () => {
  const user1 = new user({
    email: 'user1@gmail.com',
    password: 'password'
  }); 
  const user2 = new user({
    email: 'user2@gmail.com',
    password: 'password'
  });
  const user3 = new user({
    email: 'user3@gmail.com',
    password: 'password'
  });

  await user1.save();
  await user2.save();
  await user3.save();
};
module.exports = app;
