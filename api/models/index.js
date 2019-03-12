const express = require('express');
const mongoose = require('mongoose');
const user = require('./user');

const connectDb = () => {
  return mongoose.connect('mongodb://localhost:27017/iggymongoose', { useNewUrlParser: true, useCreateIndex: true });
}
const eraseDbOnSync = true;

module.exports = {
  connectDb,
  eraseDbOnSync,
  user
}
