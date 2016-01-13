// Requirements
var session = require('express-session');
var Yelp = require('yelp');

// Yelp key
var yelp = new Yelp({
  consumer_key: "cUM2s97-paI5-BlgOeUqIQ",
  consumer_secret: "tE_ShtbZHaYxEgmcbpfGO3DBpng",
  token: "WQ2Iw9H39t8PV8H-V1UjZreaDniDnztc",
  token_secret: "szUxF_dCG6v3TZrofbdYaKGzpSc" 
});

// Session Creation
exports.createSession = function(request, response, newUser) {
  console.log('Current request session before created: ' + request.session.id);
  return request.session.regenerate(function() {
    request.session.user = newUser;
    response.redirect('/app');
    console.log("Request session user saved as: " + request.session.user);
  })
}

// Login Checks
var isLoggedIn = function(request) {
  return request.session ? !!request.session.user : false;
}
var isLoggedOut = function(request) {
  return !(request.session ? !!request.session.user : false);
}

// Reroute based on Auth status
exports.checkUser = function(request, response, next) {
  console.log("Request session: ", JSON.stringify(request.session, null, "\t"));
  console.log("Request session user.id: " + request.session.user);

  if (isLoggedOut(request)) {
    console.log('Not logged in, redirecting to auth');
    response.redirect('/login')
  } else {
    console.log('Logged in, redirecting to next');
    next();
  }
}

// Central Point Math
exports.getCentralPoints = function(ownerPoints, acceptedPoints, num) {
  var d0 = (acceptedPoints[0] - ownerPoints[0]) / (num + 1);
  var d1 = (acceptedPoints[1] - ownerPoints[1]) / (num + 1);
  var points = [];
  for (var i = 1; i <= num; i++) {
    points.push({
      x: ownerPoints[0] + d0 * i,
      y: ownerPoints[1] + d1 * i
    });
  }
  console.log("points: ", points)
  return points;
}

exports.searchYelpApi = function (request, response, centerLat, centerLong){
  var cLat = centerLat;
  var cLong = centerLong;
  var cll = cLat.toString() + ',' + cLong.toString();
  var closestBar = [];
  console.log("Center lat long before API call: ", cll);

  yelp.search({ term: 'bar', ll: cll, limit: 1 })
  .then(function (data) {
    var address = data.businesses[0].location.display_address;
    address.splice(1,1);
    response.send( {
        name: data.businesses[0].name,
        address: address,
        location: data.businesses[0].location.coordinate
      });
  })
  .catch(function (err) {
  response.send(err);
  });
}
