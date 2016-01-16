angular.module('App')
	.factory('AppFactory', function($http){
    console.log('AppFactory Loading');

    var userEvent = 0;
    var userId = 0;
    var username = "";

    var locationLat = 0;
    var locationLong = 0;

    return {
      userEvent : userEvent,
      userId: userId,
      username: username,
      locationLat: locationLat,
      locationLong: locationLong
    };

	});
