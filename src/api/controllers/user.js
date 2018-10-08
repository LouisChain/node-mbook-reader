const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Const = require("../const");
const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com';
const Utils = require("../utils/utils");
const Exceptions = require("../utils/exception");
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
            Const.TOKEN_SECRET,
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

exports.grantAnonymous = (req, res, next) => {
  let _id = new mongoose.Types.ObjectId();
  let email = _id + "@email.com";
  let fbId = "fb00000000";
  let name = "Anonymous";
  let { token, refreshToken, expiresAt } = genToken(_id.toHexString(), fbId, email);
  let newUser = new User({
    _id,
    email,
    facebookProvider: {
      id: fbId,
      name
    },
    expiresAt,
    refreshToken
  });
  newUser.save()
    .then(doc => {
      let response = {
        id: _id,
        fbId,
        token,
        refreshToken,
        name,
        email,
        birthday: "01-01-2018",
        gender: "femail",
        avatar: "",
        expiresAt
      }
      res.status(200).json(response)
    })
    .catch(error => {
      res.status(500).json(Exceptions.unknown_error)
    })
}

exports.fbLogin = async (req, res, next) => {
  let { fbToken, anonymous } = req.body;
  let isValidAccessToken = await verifyFbAccessToken(fbToken, Const.FACEBOOK_APP_TOKEN, Const.FACEBOOK_APP_ID);
  if (isValidAccessToken) {
    let userInfo = await getUserInfo(fbToken);
    if (!userInfo.fbId) {
      res.status(401).json(Exceptions.fb_token_expired);
      return;
    }
    let id = "";
    User.find({ "facebookProvider.id": userInfo.fbId })
      .exec()
      .then(docs => {
        // Gen token
        let { token, refreshToken, expiresAt } = genToken(id, userInfo.fbId, userInfo.email);

        if (docs.length > 0) {
          // Update user info
          id = docs[0]._id;
          let updateOps = {
            email: userInfo.email,
            facebookProvider: {
              id: userInfo.fbId,
              name: userInfo.name,
              birthday: userInfo.birthday,
              avatar: userInfo.avatar,
              gender: userInfo.gender
            },
            expiresAt,
            refreshToken
          }
          User
            .update({ _id: docs[0]._id }, { $set: updateOps })
            .exec()
            .then(result => {
              console.log(result);
            });
        } else {
          // Create one user
          let newUser = new User({
            _id: new mongoose.Types.ObjectId(),
            email: userInfo.email,
            facebookProvider: {
              id: userInfo.fbId,
              name: userInfo.name,
              birthday: userInfo.birthday,
              avatar: userInfo.avatar,
              gender: userInfo.gender
            },
            expiresAt,
            refreshToken
          });
          newUser.save();
          id = newUser._id;
        }
        let response = {
          id,
          fbId: userInfo.fbId,
          token,
          refreshToken,
          name: userInfo.name,
          birthday: userInfo.birthday,
          avatar: userInfo.avatar,
          gender: userInfo.gender,
          email: userInfo.email,
          expiresAt
        }
        res.status(200).json(response);
        // Delete anonymous
        if (anonymous) {
          User.remove({ _id: anonymous }).exec();
        }
      })
      .catch(error => {
        console.log(err);
        res.status(500).json(Exceptions.unknown_error);
      });
  } else {
    res.status(401).json(Exceptions.fb_token_invalid);
  }
}

exports.refreshToken = (req, res, next) => {
  let { id, refreshToken } = req.body;
  User.find({ _id: id, refreshToken })
    .exec()
    .then(docs => {
      if (docs.length > 0) {
        let userInfo = docs[0];
        let { token, refreshToken, expiresAt } = genToken(id, userInfo.facebookProvider.id, userInfo.email);

        User.update({ _id: id }, {
          $set: {
            refreshToken,
            expiresAt
          }
        }).exec()
          .then(result => {
            console.log("Update refreshToken >>> " + refreshToken);
          });

        let response = {
          id,
          fbId: userInfo.facebookProvider.id,
          token,
          refreshToken,
          name: userInfo.facebookProvider.name,
          birthday: userInfo.facebookProvider.birthday,
          avatar: userInfo.facebookProvider.avatar,
          gender: userInfo.facebookProvider.gender,
          email: userInfo.email,
          expiresAt
        }
        res.status(200).json(response);
      } else {
        res.status(404).json(Exceptions.refresh_token_notfound);
      }
    })
    .catch(error => {
      console.log(err);
      res.status(500).json(Exceptions.unknown_error);
    })
}

let verifyFbAccessToken = async (facebookUserAccessToken, facebookAppToken, facebookAppId) => {
  let qs = {
    input_token: facebookUserAccessToken,
    access_token: facebookAppToken
  }
  let tokenInfo = await Utils.get(`${FACEBOOK_GRAPH_URL}/debug_token`, { qs });
  tokenInfo = JSON.parse(tokenInfo);
  let isValidToken = (tokenInfo.data.app_id === facebookAppId);
  return isValidToken;
}

/**
 * Get user info from Facebook User Access Token
 */
let getUserInfo = async (facebookUserAccessToken) => {
  let fields = ['id', 'name', 'picture', 'email', 'gender', 'birthday'].join(',')
  let headers = {
    Authorization: `Bearer ${facebookUserAccessToken}`
  }
  let result = await Utils.get(`${FACEBOOK_GRAPH_URL}/me?fields=${fields}`, {
    headers
  });
  let user = JSON.parse(result);
  return {
    fbId: user.id,
    name: user.name || '',
    email: user.email || '',
    gender: user.gender || '',
    birthday: user.birthday || '',
    avatar: `${FACEBOOK_GRAPH_URL}/${user.id}/picture?type=large`
  }
}

let genToken = (id, fbId, email) => {
  let user =
  {
    id,
    fbId,
    email
  }
  let token = jwt.sign(
    user,
    Const.TOKEN_SECRET,
    {
      expiresIn: Const.TOKEN_LIFE
    }
  );

  let refreshToken = jwt.sign(
    user,
    Const.REFRESH_SECRET,
    {
      expiresIn: Const.REFRESH_LIFE
    }
  );
  let expiresAt = new Date().getTime() + Const.TOKEN_LIFE * 1000;
  return { token, refreshToken, expiresAt }
}

