const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const {User} = require('../models');

// GET users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.find(); 
    res.send(users);
  } catch(e) {
    console.log('error: ', e);
    res.sendStatus(500);
  }
});

// signup user
router.post("/signup", (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Mail exists"
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              error: err
            });
          } else {
            const user = new User({
              email: req.body.email,
              password: hash
            });
            user
              .save()
              .then(result => {
                console.log(result);
                res.status(201).json({
                  message: "User created"
                });
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({
                  error: err
                });
              });
          }
        });
      }
    });
});

router.post('/login', async (req, res, next) => {
  // check server for login
  // if login is found and matches password + email
  // authenticate
  const user = await User.find({email: req.body.email});
  console.log('user: ', user);
  if(user.length < 1) {
    return res.status(403).json({
      message: 'Auth failed'
    })
  } else {
    const passwordCompare = await bcrypt.compare(req.body.password, user[0].password);
    console.log('pasword compare: ', passwordCompare);
    if(passwordCompare) {
      res.status(200).json({message: 'login successful!'}); 
    } else {
      res.status(403).json({message: 'Auth error'});
    }
  }
});
module.exports = router;
