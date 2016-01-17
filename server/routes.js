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
        console.log('Account added.')
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
router.get('/friends', util.checkUser, function(request, response) {



  db.Friend.findAll({
    where: {
      UserId: request.session.user
    }
  }).then(function(friendList){
    if(friendList && friendList.length > 0) {
      var friendIds = friendList.map(function(friendConn){
        return {
          id: friendConn.friendId
        }
      });

      db.User.findAll({
        where: {
          $or: friendIds
        }
      }).then(function(friends){
        var friends = friends.map(function(friend){
          return {id: friend.id, username: friend.username};
        });
        response.status(200).json({ friends });
      });
    } else {
      console.log("No Friends found for ", request.session.user);
      response.sendStatus(404)
    }
  });







  // seq.query(
  //     'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
  //       replacements: [request.session.user],
  //       type: sequelize.QueryTypes.SELECT
  //     })
  //   .then(function(friends) {
  //     console.log("LINE 126: ", friends);
  //     response.status(200).json({
  //       friends
  //     });
  //   });
});

// Add a friend to current user
router.post('/friends', util.checkUser, function(request, response) {
  var friend = request.body.friend;
  console.log("Friend to add: ", friend)
  console.log("Current user: ", request.session.user)

    db.User.find({
      where: {
        username: friend
      }
    }).then(function(foundFriend) {
      if (foundFriend || foundFriend.id !== request.session.user) {

        db.Friend.findOne({
          where:{
            $or: [
              {
                friendId: foundFriend.id,
                UserId: request.session.user
              },
              {
                friendId: request.session.user,
                UserId: foundFriend.id
              }
            ]
          }
        }).then(function(result){
          if(result === null){
            // create connections
            db.Friend.create({
              friendId: foundFriend.id,
              UserId: request.session.user
            });
            db.Friend.create({
              friendId: request.session.user,
              UserId: foundFriend.id
            });
            console.log('You two are bros now!')
            response.sendStatus(201)
          } else {
            // connections already exist
            console.log("bromance already created inside")
            response.sendStatus(409)
          }
        })









        // db.Friend.findOrCreate({
        //   where: {
        //     friendId: foundFriend.id,
        //     UserId: request.session.user
        //   }
        // }).spread(function(result) {
        //   if (result.$options.isNewRecord === true) {
        //     db.Friend.findOrCreate({
        //       where: {
        //         friendId: request.session.user,
        //         UserId: foundFriend.id
        //       }
        //     }).spread(function(result) {
        //       if (result.$options.isNewRecord === true) {
        //         console.log('You two are bros now!')
        //         response.sendStatus(201)
        //       } else {
        //         console.log("bromance already created inside")
        //         response.sendStatus(409)
        //       }
        //     })
        //   } else {
        //     console.log("bromance already created")
        //     response.sendStatus(409)
        //   }
        // });
        //










      } else {
        console.log("That friend doesn't exist, or you are that friend")
        response.sendStatus(400)
      }
    });
});

// Check one event
router.get('/events/:id', util.checkUser, function(request, response) {
  var eventId = request.params.id;
  seq.query(
      'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
        replacements: [request.session.user],
        type: sequelize.QueryTypes.SELECT
      })
    .then(function(friendList) {
      if (!!friendList && friendList.length !== 0) {
        var friendIds = friendList.map(function(usersFriends) {
          return {
            UserId: {
              $eq: usersFriends.id
            }
          };
        });
        friendIds.push({
          UserId: {
            $eq: request.session.user
          }
        });
        db.Event.findAll({
          where: {
            id: eventId,
            $or: friendIds
          }
        }).then(function(item) {
          response.status(200).json(item)
        })
      } else {
        response.sendStatus(404);
      }
    })
})


// Get a list of all events
router.get('/events', util.checkUser, function(request, response) {
  seq.query(
      'SELECT Users.id, Users.username FROM Users where Users.id in (SELECT Friends.FriendId from Friends where Friends.UserId = ?)', {
        replacements: [request.session.user],
        type: sequelize.QueryTypes.SELECT
      })
    .then(function(friendList) {
      if(!!friendList && friendList.length !== 0) {
        var friendIds = friendList.map(function(usersFriends) {

          return {
            UserId: {
              $eq: usersFriends.id
            }
          };
        });

        var timelimit = new Date();
        timelimit.setHours(timelimit.getHours() - 1);

        db.Event.findAll({
          where: {
            accepted: 0,
            $or: friendIds,
            createdAt: {
              $gt: timelimit
            }
          }
        }).then(function(results) {
          if (results) {
            // var results = item.map(function(item, index) {
            //   if(friendList[index]){
            //     item.dataValues.username = friendList[index].username;
            //     return item
            //   }
            // })
            response.status(200).json({results})
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
router.post('/events/:id', util.checkUser, function(request, response) {
  var id = request.params.id;
  var acceptedId = request.session.user;
  var acceptedAt = Date.now();
  var acceptedLat = request.body.acceptedLat;
  var acceptedLong = request.body.acceptedLong;

  db.Event.findById(id)
    .then(function(acceptedEvent) {
      if (acceptedEvent.accepted !== true) {
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
            acceptedEvent.acceptedName = acceptor.username;
            acceptedEvent.acceptedId = request.session.user; // TO TEST
            acceptedEvent.acceptedLat = acceptedLat;
            acceptedEvent.acceptedLong = acceptedLong;
            acceptedEvent.acceptedAt = acceptedAt;
            acceptedEvent.centerLat = centralLatLong[0].x;
            acceptedEvent.centerLong = centralLatLong[0].y;
            acceptedEvent.accepted = true;
            console.log("acceptedEvent: ", JSON.stringify(acceptedEvent,
              null, "\t"));
            acceptedEvent.save()
            console.log("Sweet! We updated that event, Angelina Brolie.")

            db.User.findById(request.session.user)
            .then(function (currentUser) {
              db.Event.findById(currentUser.currentEvent)
              .then(function (currentEvent) {
                currentEvent.update({
                  accepted: true
                })
              })
            })

            response.status(202).json(acceptedEvent)
            acceptor.update({
                currentEvent: acceptedEvent.id
              })
              .then(function () {
                console.log("currentEvent updated for userid", request.session.user)
              })
          })
      } else {
        console.log("That event already expired, Brosephalus.")
        response.status(403)
      };
    });
});

// Creating new event
router.post('/events', util.checkUser, function(request, response) {
  var UserId = request.session.user;
  var ownerLat = request.body.ownerLat;
  var ownerLong = request.body.ownerLong;
  var eventType = request.body.eventType;
  var message = request.body.message || null;

  if (UserId !== null || ownerLat !== null || ownerLong !== null) {

    var timelimit = new Date();

    if(Number(eventType) !== Number(2)){
      timelimit.setHours(timelimit.getHours() - 1);
    }

    db.Event.find({
      where: {
        UserId: UserId,
        createdAt: {
          $gt: timelimit
        },
        accepted: false,
        eventType: 1
      }
    }).then(function(result) {
      if(result === null) {
        db.Event.create({
          UserId: UserId,
          ownerLat: ownerLat,
          ownerLong: ownerLong,
          eventType: eventType,
          message: message
        }).then(function(result){
          if (result.$options.isNewRecord === true) {
            db.User.find({
              where: {
                id: request.session.user
              }
            }).then(function(owner) {
              result.ownerName = owner.username;
              result.save()
              console.log('time to turn up, Bro-ntosaurus!')
              response.status(201).send(result);
              if (Number(eventType) === Number(1)) {
                owner.update({
                  currentEvent: result.id
                })
                .then(function () {
                  console.log("Event recognized as brewski")
                })
              }
            })
          } else {
            console.log("That record already exists")
            response.sendStatus(202)
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
  }
});

// Return current user
router.get('/user', util.checkUser, function (request, response) {
  db.User.find({
    where: {
      id: request.session.user
    }
  }).then(function(result){
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
