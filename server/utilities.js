var session = require('express-session');

exports.createSession = function(request, response, newUser) {
  return request.session.regenerate(function(){
    request.session.user = newUser;
  })
}

var isLoggedIn = function (request) {
  return request.session ? !!request.session.user : false;
}

var isLoggedOut = function (request) {
  return !(request.session ? !!request.session.user : false);
}

exports.checkUser = function (request, response, next) {
  console.log("request.session: ", JSON.stringify(request.session, null, "\t"));
  if(isLoggedOut(request)){
    response.redirect('/login')
  } else {
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
