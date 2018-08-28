const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Const = require("../const");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length >= 1) {
        return res.status(409).json({ error: "Email exists" });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({ error: err });
          } else {
            let user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user.save()
              .then(result => {
                res.status(201).json({
                  message: "User created",
                  user: result
                })
              })
              .catch(err => {
                console.log(err);
                res.status(500).json({ error: err });
              })
          }
        })
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
}

exports.login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then(user => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Auth failed"
        })
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed"
          })
        }
        if (result) {
          let token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id
            },
            Const.JWT_KEY,
            {
              expiresIn: "1h"
            }
          );
          return res.status(200).json(
            {
              message: "Auth successful",
              token
            }
          )
        }

        res.status(401).json({
          message: "Auth failed"
        })
      })
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
}

exports.deleteUser = (req, res, next) => {
  User.remove({ _id: req.params.id })
    .exec()
    .then(result => {
      res.status(200).json({ message: "User deleted" });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    })
}