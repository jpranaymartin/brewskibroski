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
        console.log('You\'re now a Bro, bro!')
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
    } else {
      response.sendStatus(401);
    }
  })
})

// Reroute to app
router.get('/app', util.checkUser, function (request, response) {
  var dirname = __dirname
  dirname = dirname.slice(0,-6)
  console.log("You're in, Broce Lee!")
  response.sendFile(dirname + '/client/app.html');
})

// User logout
router.get('/logout', function (request, response) {
  request.session.destroy(function(){
    console.log("You\'re out, Bromeslice")
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
router.get('/eventslist', function (request, response) { //NOT FULLY IMPLEMENTED. NOT SURE IF TWO CALLS ARE THE WAY TO GO
  //TO EDIT ... COPIED FROM friendslist
  seq.query('SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)',
  {
    replacements: [request.session.user],
    type: sequelize.QueryTypes.SELECT
  })
  .then(function(friendList){
    console.log("friendList: ", friendList)
    var friendIds = friendList.map(function (usersFriends) {

      console.log("usersFriends: ", usersFriends.id)
      return {UserId: {$eq: usersFriends.id}};
    });
    db.Event.findAll({
      where: {
        $or: friendIds
      }
    }).then(function (item) {
      if (item) {
        var results = item.map(function (item, index) {
          item.dataValues.username = friendList[index].username;
          return item
        })
        response.json({results})
        response.end()
      }else{
        console.log("what?")
        response.send(404)
      };;
    })
  });
})

//Creating new event
router.post('/createevent', function (request, response) {
  var UserId = request.session.user;
  var ownerLat = request.body.ownerLat;
  var ownerLong = request.body.ownerLong;
  var active = true;
  // var eventType = request.body.eventType; //NEED TO UNCOMMENT TO ADD BROSKIS

  if (UserId !== null || ownerLat !== null || ownerLong !== null || active !== null) {
    db.Event.findOrCreate({
      where: {
        UserId: UserId,
        ownerLat: ownerLat,
        ownerLong: ownerLong,
        active: active
      }
    }).spread(function(result){
      if(result.$options.isNewRecord === true){
        console.log("here")
        db.User.find(
          {
            where: {
              id: request.session.user
            }
          }).then(function (owner) {
            result.ownerName = owner.username;
            result.save()
            console.log('time to turn up, Bro-ntosaurus!')
            response.status(201)
            response.end()
          })
      }else{
        console.log("Event already created, Broham")
        response.status(404)
        response.end()
      }
    })

  }else{
    console.log("Bro, some or all your incoming data is null, bro")
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

      db.User.find({
        where:{
          id: request.session.user
        }
      })
      .then(function (acceptor) {
        console.log("acceptor: ", acceptor)
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
        acceptedEvent.acceptedName = acceptor.username;
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
        console.log("Sweet! We updated that event, Angelina Brolie.")
        response.json(acceptedEvent)
        response.end()
      })

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
          db.Friend.findOrCreate({
            where : {
              friendId: request.session.user,
              UserId: foundFriend.id
            }
          }).spread(function(result){
            if(result.$options.isNewRecord === true){
              console.log('You two are bros now!')
              response.status(201)
              response.end()
            }else{
              console.log("bromance already created")
              response.status(404)
              response.end()
            }
          })
        }else{
          console.log("bromance already created")
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

router.get('/friendslist', function (request, response) {
  seq.query('SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)',
  {
    replacements: [request.session.user],
    type: sequelize.QueryTypes.SELECT
  })
  .then(function(friends){
      response.json({friends})
      response.end()
  });
})

module.exports = router;







