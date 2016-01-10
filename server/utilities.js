var request = require('request');

exports.createSession = function(request, response, newUser) {
  return request.session.regenerate(function(){
    request.session.user = newUser;
    response.redirect('/app');
  })
}

var isLoggedIn = function (request) {
  return request.session ? !!request.session.user : false;
}

var isLoggedOut = function (request) {
  return !(request.session ? !!request.session.user : false); 
}

exports.checkUser = function (request, response, next) {
  if(isLoggedOut(request)){
    response.redirect('/auth')
  } else {
    next();
  }
}