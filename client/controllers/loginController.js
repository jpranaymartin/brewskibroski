angular.module('Auth.login', [])
	.controller('LoginController', function($scope, $http, AuthFactory){
		$scope.login = function(){AuthFactory.login($scope.user, $scope.pass)}
	});