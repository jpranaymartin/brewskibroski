angular.module('App')
	.factory('AppFactory', function($http){
    console.log('AppFactory Loading');

    var userEvent = 0;
    var userId = 0;
    var username = "";


    return {
      userEvent : userEvent,
      userId: userId,
      username: username
    };

	});