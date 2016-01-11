var router = require('express').Router();
var mysql = require('mysql');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var db = require('./db');
var util = require('./utilities');
var request = require('request');
var sequelize = require('sequelize');
var seq = new sequelize('brewskitest1', 'root', '');

//Open App
router.get('/', util.checkUser, function (request, response) {
  response.redirect('/app');
});

// User signup
router.post('/authsignup', function (request, response){
  var username = request.body.username;
  var password = request.body.password;
  var email = request.body.email;
  if (username !== null || password !== null || email !== null) {
    db.User.findOrCreate({
      where: {
        username: username,
        password: password,
        email: email
      }
    }).spread(function(result, created){
      if(created === true){
        console.log('Success!')
        util.createSession(request, response, result.dataValues.id);
      }else{
        var dirname = __dirname;
        dirname = dirname.slice(0, -6);
        response.sendFile(dirname + '/client/auth.html');
      }
    })
  }else{
    response.sendStatus(401);
  };
})

// User login
router.post('/authlogin', function (request, response) {
  var username = request.body.username;
  var password = request.body.password;

  console.log('Attempted login username: ' + request.body.username);
  console.log('Attempted login password: ' + request.body.password);

  db.User.find({
    where: {
      username: username,
      password: password
    }
  }).then(function(result){
    if(result){
      console.log('User result.id being passed into session: ' + username);
      util.createSession(request, response, result.id);
      // response.redirect(302, '/app');
    } else {
      response.sendStatus(401); //Handled on the front end
    }
  })
})

// Reroute to app
router.get('/app', util.checkUser, function (request, response) {
  var dirname = __dirname
  dirname = dirname.slice(0,-6)
  response.sendFile(dirname + '/client/app.html');
})

// User logout
router.get('/logout', function (request, response) {
  request.session.destroy(function(){
    response.redirect('/login');
  })
})

// Reroute to login after logout
router.get('/login', function (request, response) {
  var dirname = __dirname
  dirname = dirname.slice(0, -6)
  response.sendFile(dirname + '/client/auth.html')
})

//Populate Event List
router.get('/populateapp', function (request, response) { //NOT FULLY IMPLEMENTED. NOT SURE IF TWO CALLS ARE THE WAY TO GO
  var username = request.body.username;
  db.User.find({
    where: {
      id: '1' //or username: 'daniel1'
    }
  })
  .then(function (result) {
    response.json({result})
  })
})

//Creating new event
router.post('/events', function (request, response) {
  var UserId = request.session.user;  //TO TEST WITH AUTH
  var ownerLat = request.body.ownerLat;
  var ownerLong = request.body.ownerLong;
  var active = request.body.active;

  if (UserId !== null || ownerLat !== null || ownerLong !== null || active !== null) {
    db.Event.findOrCreate({
      where: {
        UserId: UserId, //Not being set for some reason.
        ownerLat: ownerLat,
        ownerLong: ownerLong,
        active: active
      }
    }).spread(function(result){
      if(result.$options.isNewRecord === true){
        console.log('Success!')
        response.status(201)
        response.end()
      }else{
        console.log("Event already created")
        response.status(404)
        response.end()
      }
    })

  }else{
    console.log("Some or all incoming data is null")
    response.status(404)
    response.end()
  };
})


//Accept event invite
router.post('/eventaccept', function (request, response) {
  var id = request.body.id;
  var acceptedId = request.body.acceptedId;
  var acceptedAt = Date.now();
  var acceptedLat = request.body.acceptedLat;
  var acceptedLong = request.body.acceptedLong;

  db.Event.findById(id)
  .then(function(acceptedEvent) {

    if (acceptedEvent.active === true) {
      var lat1 = acceptedEvent.ownerLat;
      var lon1 = acceptedEvent.ownerLong;
      var lat2 = acceptedLat;
      var lon2 = acceptedLong;

      //DEFINE CENTRAL LAT/LONG
      var ownerPoints = [lat1,lon1]
      var acceptedPoints = [lat2,lon2]
      var centralLatLong;
      centralLatLong = util.getCentralPoints(ownerPoints, acceptedPoints, 1)

      console.log("acceptedEvent: ", JSON.stringify(acceptedEvent, null, "\t"));
      acceptedEvent.acceptedId = request.session.user; // TO TEST
      acceptedEvent.acceptedLat = acceptedLat;
      acceptedEvent.acceptedLong = acceptedLong;
      acceptedEvent.acceptedAt = acceptedAt;
      acceptedEvent.centerLat = centralLatLong[0].x;
      acceptedEvent.centerLong = centralLatLong[0].y;
      acceptedEvent.accepted = true;
      acceptedEvent.active = false;

      console.log("acceptedEvent: ", JSON.stringify(acceptedEvent, null, "\t"));
      acceptedEvent.save()
      response.json(acceptedEvent)
      response.end()
    }else{
      console.log("That event already expired, Brosephalus.")
      response.status(406)
      response.end()
    };
  });
});

router.post('/addfriend', function (request, response) {
  console.log("request.body: ", request.body)
  var friend = request.body.friend;
  console.log("friend: ", friend)
  console.log("request.session.user: ", request.session.user)
  db.User.find({
    where: {
      username: friend
    }
  }).then(function (foundFriend) {
    console.log("foundFriend: ", foundFriend)
    if (foundFriend) {
      db.Friend.findOrCreate({
        where : {
          friendId: foundFriend.id,
          UserId: request.session.user
        }
      }).spread(function(result){
        if(result.$options.isNewRecord === true){
          console.log('Success!')
          response.status(201)
          response.end()
        }else{
          console.log("Friendship already created")
          response.status(404)
          response.end()
        }
      })
    }else{
      console.log("That friend doesn't exist, bromancer")
      response.status(404)
      response.end()
    };;
  })
})

router.get('/friendlist', function (request, response) {
  seq.query('SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)',
  {
    replacements: [request.session.user],
    type: sequelize.QueryTypes.SELECT
  })
  .then(function(rows){
            response.json({rows})
            response.end()
        });
})

module.exports = router;







