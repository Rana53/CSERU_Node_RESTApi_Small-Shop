const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require("../models/user");
const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + file.originalname)
  }
});

const upload = multer({
  storage: storage,
});

router.post('/signup', (req, res, next) => {
  User.find({email: req.body.email})
  .exec()
  .then(user =>{
    if(user.length >= 1){  // if i not put 1 it should always true because user take empty array so it's not null
      return res.status(404).json({ message: "User already exist"});
    }
    else{
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if(err){
          return res.status(500).json({ error: err});
        }
        else{
          const user = new User({
            _id: mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash
          });
          user.save()
          .then(result =>{
            console.log(result);
            res.status(200).json(result);
          })
          .catch(err =>{
            res.status(500).json({ error: err})
          });
        }
      });
    }
  })
  .catch(err =>{
    res.status(500).json({ error: err})
  });
});

router.post("/login", (req, res, err) => {
  User.find({email: req.body.email})
  .exec()
  .then(user =>{
    if(user.length < 1){
      return res.status(401).json({ message: "Auth Fail"});
    }
    bcrypt.compare(req.body.password, user[0].password, (err, result) =>{
      if(err)
        res.status(500).json({error: err});
      if(!result)
        return res.status(401).json({ message: "Auth Fail"});
      else{
        const token = jwt.sign({
          email: user[0].email,
          userId: user[0]._id
        },"secret",
        {
          expiresIn: "1h"
        }
      );
        res.status(200).json({ message: "Auth successfully", token: token});
      }
    });
  })
  .catch(err =>{
    res.status(500).json({error: err});
  })
});
router.delete('/:userId', (req, res, err)=>{
  User.deleteOne({_id: req.params.userId})
  .exec()
  .then(result =>{
      if(result.deletedCount > 0)
          res.status(200).json({ message: "User deleted", result : result});
      else
          res.status(200).json({ message: "User data not found", result : result});
  })
  .catch(err =>{
    console.log(err);
    res.status(500).json({ error: err});
  });
});


module.exports = router;
