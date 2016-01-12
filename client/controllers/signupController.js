angular.module('Auth.signup', [])
	.controller('SignupController', function($scope, $http, AuthFactory){
		$scope.signup = function(){AuthFactory.signup($scope.userS, $scope.passS, $scope.email)}
	});