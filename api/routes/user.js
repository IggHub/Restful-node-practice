const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
  try {
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
        const token = jwt.sign({
          email: user[0].email,
          password: user[0].password // need to use user[0]'s instead of req.body.pasword, because that one has unencrypted password. Don't want to be carrying plaintext password in JWT as that is sensitive info
        }, 'secret', {expiresIn: '30min'}); 

        res.status(200).json({message: 'login successful!', token}); 
      } else {
        res.status(401).json({message: 'Auth error'});
      }
    }
  } catch (err) {
    console.log('error: ', err);
    res.send(500).json({
      message: 'auth error'
    });
  }
});

// protect the route
router.get('/user/:userId',checkToken, async(req, res, next) => {
  jwt.verify(req.token, 'secret', async (err, decodedData) => {
    if(err) {
      console.log('err: ', err);
      res.send(401).json({message: 'your token doen\'t match'});
    } else {
      const paramsUserId = req.params.userId;
      console.log('userId: ', paramsUserId);

      const data = decodedData;
      const email = data.email;
      const password = data.password;
      
      const user = await User.find({email: email});
      res.send('successful');
    }
  }); 
});

router.delete('/user/:userId', async (req, res, next) => {
  try {
    console.log('token: ', req.body.token);
    jwt.verify(req.body.token, 'secret', async (err, decoded) => {
      if(err) {
        console.log('err: ', err);
        return res.send(403).json({message: 'action failed'});
      }  
      const user = await User.find({email: req.body.email});
      const result = await user.remove(); 
      return res.status(200).json({
        message: 'action successful'
      });
    });

  } catch(err) {
    console.log('Error: ', err);
    res.status(500).json({
      message: 'Action failed'
    });
  }
});

function checkToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if(typeof authHeader !== 'undefined'){
    const bearerToken = authHeader.split(' ')[1];
    console.log('bearer is: ', bearerToken);
    req.token = bearerToken;
    next();
  } else {
    return res.send('checkToken failed...');
  }
};
module.exports = router;
