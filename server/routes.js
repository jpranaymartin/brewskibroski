// Requirements
var router = require('express').Router();
var request = require('request');
var parser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');

// Database Requirements
var mysql = require('mysql');

// Models
var db = require('./db'); // Available: .User, .Event, .Friend

// Sequelize Extras to enable raw SQL
var sequelize = require('./db').Sequelize;
var seq = require('./db').seq;

// Authentication and Calculation utilities
var util = require('./utilities');

// Open app if logged in, middleware will reroute if not
router.get('/', util.checkUser, function(request, response) {
  response.redirect('/app');
});

// Serve the authentication SPA when logged out
router.get('/login', function(request, response) {
  var dirname = __dirname
  dirname = dirname.slice(0, -6)
  response.status(200).sendFile(dirname + '/client/auth.html')
})

// Create a new User
router.post('/signup', function(request, response) {
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
    }).spread(function(result, created) {
      if (created === true) {
        console.log('You\'re now a Bro, bro!')
        util.createSession(request, response, result.dataValues.id);
      } else {
        var dirname = __dirname;
        dirname = dirname.slice(0, -6);
        response.status(409).sendFile(dirname + '/client/auth.html');
      }
    })
  } else {
    response.sendStatus(400);
  };
})

// User login API to create session
router.post('/login', function(request, response) {
  var username = request.body.username;
  var password = request.body.password;

  console.log('Attempted login username: ' + request.body.username);
  console.log('Attempted login password: ' + request.body.password);

  db.User.find({
    where: {
      username: username,
      password: password
    }
  }).then(function(result) {
    if (result) {
      console.log('User result.id being passed into session: ' + username);
      util.createSession(request, response, result.id);
    } else {
      response.sendStatus(401);
    };
  });
});

// User logout
router.get('/logout', function(request, response) {
  request.session.destroy(function() {
    console.log("You\'re out, Bromeslice")
    response.redirect('/login');
  });
});

// Reroute to app
router.get('/app', util.checkUser, function(request, response) {
  var dirname = __dirname
  dirname = dirname.slice(0, -6)
  console.log("You're in, Broce Lee!")
  response.status(202).sendFile(dirname + '/client/app.html');
});

// Get current user's friends
router.get('/friends', function(request, response) {
  seq.query(
      'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
        replacements: [request.session.user],
        type: sequelize.QueryTypes.SELECT
      })
    .then(function(friends) {
      response.status(200).json({
        friends
      });
    });
});

// Add a friend to current user
router.post('/friends', function(request, response) {
  console.log("request.body: ", request.body)
  var friend = request.body.friend;
  console.log("friend: ", friend)
  console.log("request.session.user: ", request.session.user)
  db.User.find({
    where: {
      username: friend
    }
  }).then(function(foundFriend) {
    console.log("foundFriend: ", foundFriend)
    if (foundFriend) {
      db.Friend.findOrCreate({
        where: {
          friendId: foundFriend.id,
          UserId: request.session.user
        }
      }).spread(function(result) {
        if (result.$options.isNewRecord === true) {
          db.Friend.findOrCreate({
            where: {
              friendId: request.session.user,
              UserId: foundFriend.id
            }
          }).spread(function(result) {
            if (result.$options.isNewRecord === true) {
              console.log('You two are bros now!')
              response.sendStatus(201)
            } else {
              console.log("bromance already created")
              response.sendStatus(409)
            }
          })
        } else {
          console.log("bromance already created")
          response.sendStatus(409)
        }
      });
    } else {
      console.log("That friend doesn't exist, bromancer")
      response.sendStatus(404)
    }
  });
});

// Check one event
router.get('/events/:id', function(request, response) {
  var eventId = request.params.id;
  console.log("eventId", eventId);
  seq.query(
      'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
        replacements: [request.session.user],
        type: sequelize.QueryTypes.SELECT
      })
    .then(function(friendList) {
      if(!!friendList && friendList.length !== 0) {
        console.log("friendList: ", friendList)
        var friendIds = friendList.map(function(usersFriends) {

          console.log("usersFriends: ", usersFriends.id)
          return {
            UserId: {
              $eq: usersFriends.id
            }
          };
        });
        db.Event.findAll({
          where: {
            id: eventId,
            $or: friendIds
          }
        }).then(function(item) {
          if (item) {
            var results = item.map(function(item, index) {
              item.dataValues.username = friendList[index].username;
              return item
            })
            response.status(200).json({
              results
            })
          } else {
            response.sendStatus(404);
          };
        });
      } else {
        response.sendStatus(404);
      }
    });
});

// Get a list of all events
router.get('/events', function(request, response) {
  seq.query(
      'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
        replacements: [request.session.user],
        type: sequelize.QueryTypes.SELECT
      })
    .then(function(friendList) {
      console.log("friendList:", friendList);
      if(!!friendList && friendList.length !== 0) {
        var friendIds = friendList.map(function(usersFriends) {

          console.log("usersFriends: ", usersFriends.id)
          return {
            UserId: {
              $eq: usersFriends.id
            }
          };
        });
        db.Event.findAll({
          where: {
            accepted: 0,
            $or: friendIds
          }
        }).then(function(item) {
          if (item) {
            var results = item.map(function(item, index) {
              if(friendList[index]){
                item.dataValues.username = friendList[index].username;
                return item
              } return "undefined";
            })
            response.status(200).json({
              results
            })
          } else {
            response.sendStatus(404)
          };
        });
      } else {
        response.sendStatus(404);
      }
    });
});

// Accept event invite
router.post('/events/:id', function(request, response) {
  var id = request.params.id;
  var acceptedId = request.session.user;
  var acceptedAt = Date.now();
  var acceptedLat = request.body.acceptedLat;
  var acceptedLong = request.body.acceptedLong;

  db.Event.findById(id)
    .then(function(acceptedEvent) {
      if (acceptedEvent.active === true) {
        db.User.find({
            where: {
              id: request.session.user
            }
          })
          .then(function(acceptor) {
            console.log("acceptor: ", acceptor)
            var lat1 = acceptedEvent.ownerLat;
            var lon1 = acceptedEvent.ownerLong;
            var lat2 = acceptedLat;
            var lon2 = acceptedLong;
            var ownerPoints = [lat1, lon1]
            var acceptedPoints = [lat2, lon2]
            var centralLatLong;
            centralLatLong = util.getCentralPoints(ownerPoints,
              acceptedPoints, 1)
            console.log("acceptedEvent: ", JSON.stringify(acceptedEvent,
              null, "\t"));
            acceptedEvent.acceptedName = acceptor.username;
            acceptedEvent.acceptedId = request.session.user; // TO TEST
            acceptedEvent.acceptedLat = acceptedLat;
            acceptedEvent.acceptedLong = acceptedLong;
            acceptedEvent.acceptedAt = acceptedAt;
            acceptedEvent.centerLat = centralLatLong[0].x;
            acceptedEvent.centerLong = centralLatLong[0].y;
            acceptedEvent.accepted = true;
            acceptedEvent.active = false;
            console.log("acceptedEvent: ", JSON.stringify(acceptedEvent,
              null, "\t"));
            acceptedEvent.save()
            console.log("Sweet! We updated that event, Angelina Brolie.")
            response.status(202).json(acceptedEvent)
            response.end()
            acceptor.update({
                currentEvent: acceptedEvent.id
              })
              .then(function () {
                console.log("currentEvent updated for", request.session.user)
              })
          })
      } else {
        console.log("That event already expired, Brosephalus.")
        response.status(403)
        response.end()
      };
    });
});

// Creating new event
router.post('/events', function(request, response) {
  var UserId = request.session.user;
  var ownerLat = request.body.ownerLat;
  var ownerLong = request.body.ownerLong;
  var active = true;
  // var eventType = request.body.eventType; //NEED TO UNCOMMENT TO ADD BROSKIS

  if (UserId !== null || ownerLat !== null || ownerLong !== null || active !==
    null) {
    db.Event.find({
      where: {
        UserId: UserId,
        active: active
      }
    }).then(function(result) {
      if(result === null) {
        console.log("here1")
        db.Event.create({
          UserId: UserId,
          ownerLat: ownerLat,
          ownerLong: ownerLong,
          active: active
        }).then(function(result){
          if (result.$options.isNewRecord === true) {
            console.log("here2")
            db.User.find({
              where: {
                id: request.session.user
              }
            }).then(function(owner) {
              result.ownerName = owner.username;
              result.save()
              console.log('time to turn up, Bro-ntosaurus!')
              response.status(201).send(result);
              owner.update({
                currentEvent: result.id
              })
              .then(function () {
                console.log("currentEvent updated for", request.session.user)
              })
            })
          } else {
            console.log("Event already created, Broham")
            response.sendStatus(409)
          }
        });
      } else {
        console.log("Event already created, Broham")
        response.sendStatus(409)
      }
    });
  } else {
    console.log("Bro, some or all your incoming data is null, bro")
    response.sendStatus(400)
    response.end()
  }
});

// Return current user
router.get('/user', function (request, response) {
  db.User.find({
    where: {
      id: request.session.user
    }
  }).then(function(result){
    console.log("/user db search result:", result);
    var user = {
      id: result.id,
      username: result.username,
      currentEvent: result.currentEvent

    }
    response.status(200).send(user);
  });
});

// Search Yelp
router.post('/yelp', function (request, response) {
  var centerLat = request.body.centerLat;
  var centerLong = request.body.centerLong;
  console.log("Center lat from form: ", centerLat);
  console.log("Center long from form: ",centerLong);

  util.searchYelpApi(request, response, centerLat, centerLong);
});

// Search Uber
router.post('/uber', function (request, response) {
  var startLat = request.body.startLat;
  var startLong = request.body.startLong;
  var endLat = request.body.endLat;
  var endLong = request.body.endLong;

  console.log("Start lat from form: ", startLat);
  console.log("Start long from form: ", startLong);
  console.log("End lat from form: ", endLat);
  console.log("End long from form: ", endLong);

  util.searchUberApi(request, response, startLat, startLong, endLat, endLong);
});

module.exports = router;
