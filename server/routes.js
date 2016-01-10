// var controllers = require('./controllers');
var router = require('express').Router();
var mysql = require('mysql');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var db = require('./db');
var util = require('./utilities');



router.get('/', util.checkUser, function (request, response){
  response.redirect('/app');
})

// User signup
router.post('/auth', function (request, response){
  var username = request.body.username;
  var password = request.body.password;
  var email = request.body.email;

  db.User.findOrCreate({
    where: {
      username: username,
      password: password,
      email: email
    }
  }).spread(function(result){
    if(result){
      console.log('Success!')
      response.status(201).redirect('/app')
    }
  })
})

// User login
router.get('/auth', function (request, response){
  var username = request.body.username;
  var password = request.body.password;
  var email = request.body.email;

  db.User.find({
    where: {
      username: username,
      password: password
    }
  }).then(function(result){
    if(result){
      // start user session
      util.createSession(request, response, username);
      response.send(201);
    } else {
      response.send(401);
    }
  })
})

// Reroute to app
router.get('/app', util.checkUser, function (request, response) {
  response.sendFile(__dirname + '/app.html');
})

// User logout
router.get('/logout', function (request, response) {
  request.session.destroy(function(){
    response.redirect('/login');
  })
})

// Reroute to login after logout
router.get('/login', function (request, response) {
  response.sendFile(__direname + '/auth.html')
})


module.exports = router;
