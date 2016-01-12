angular.module('Auth')
	.factory('AuthFactory', function($http){
		var login = function(usern, passw){
			console.log("username", usern, "password", passw);
			return $http ({
				method: 'POST',
				url: '/authlogin',
				data: {
					username: usern,
					password: passw
				}
			})
			.then(function(success){
				console.log(success);
			}, function(err){
				console.log(err);
			})
		};

		var signup = function(usern, passw1, email){
			console.log("username", usern, "password", passw1, "email", email);
			return $http({
				method: 'POST',
				url: '/authsignup',
				data: {
					username: usern,
					password: passw1,
					email: email
				}
			})
			.then(function(success){
				console.log(success);
			}, function(err){
				console.log(err);
			})
		};

		return {
			login: login,
			signup: signup
		}
	});