angular.module('App',[
	'ui.router',
	'App.main',
	'App.event',
	'App.settings',
	'App.map'
	])
	.config(function($stateProvider, $urlRouterProvider){
		$stateProvider
			.state('main',{
				url:'/main',
				templateUrl: 'templates/main.html',
				controller: 'MainController'
			})
			.state('event',{
				url: '/event',
				templateUrl: 'templates/event.html',
				controller: 'EventController'
			})
			.state('settings',{
				url: '/settings',
				templateUrl: 'templates/settings.html',
				controller: 'SettingsController'
			});
		$urlRouterProvider
			.otherwise('/main');
	})