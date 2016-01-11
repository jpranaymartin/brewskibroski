var session = require('express-session');

exports.createSession = function(request, response, newUser) {
  console.log('Current request session before created: ' + request.session);
  return request.session.regenerate(function(){
    request.session.user = newUser;
    response.redirect('/app');
    console.log("Request session user saved as: " + request.session.user);
  })
}

var isLoggedIn = function (request) {
  return request.session ? !!request.session.user : false;
}

var isLoggedOut = function (request) {
  return !(request.session ? !!request.session.user : false);
}

exports.checkUser = function (request, response, next) {
  console.log("Request session: ", JSON.stringify(request.session, null, "\t"));
  console.log("Request session user in user check: " + request.session.user);
  if(isLoggedOut(request)){
    console.log('Not logged in, redirecting to auth');
    response.redirect('/login')
  } else {
    console.log('Logged in, redirecting to next');
    next();
  }
}

exports.getCentralPoints = function (ownerPoints, acceptedPoints, num) {
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
