angular.module('Auth')
	.factory('AuthFactory', function($http){
		var login = function(usern, passw){
			console.log("Logging in as username: ", usern, " & password:", passw);
			return $http ({
				method: 'POST',
				url: '/login',
				data: {
					username: usern,
					password: passw
				}
			})
			.then(function(success){
				console.log(success);
				window.location.replace('/app');
			}, function(err){
				console.log(err);
			})
		};

		var signup = function(usern, passw1, email){
			console.log("Signing up as username: ", usern, ", password: ", passw1, " & email: ", email);
			return $http({
				method: 'POST',
				url: '/signup',
				data: {
					username: usern,
					password: passw1,
					email: email
				}
			})
			.then(function(success){
				console.log(success);
				window.location.replace('/app');
			}, function(err){
				console.log(err);
			})
		};

		return {
			login: login,
			signup: signup
		}
	});
