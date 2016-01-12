angular.module('Auth',[
	'ui.router',
	'Auth.login',
	'Auth.signup',
	'ngMessages'
	])
	.config(function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('login',{
				url: '/login',
				templateUrl: 'templates/login.html',
				controller: 'LoginController'
			})
			.state('signup',{
				url: '/signup',
				templateUrl: 'templates/signup.html',
				controller: 'SignupController'
			});
		$urlRouterProvider
			.otherwise('/login');
	})

	//<a ui-sref="statename">
	//<a ui-sref="login"

	//$stateChangeStart
	//$stateChangeSuccess