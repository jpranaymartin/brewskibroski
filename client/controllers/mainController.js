angular.module('App.main',[])
	.controller('MainController', function($http, $scope, $q, $window, $location, $rootScope, AppFactory){



		$scope.showEvent = AppFactory.userEvent ? AppFactory.userEvent.accepted : false;
		//getUsername						WORKS
		//checkEvents           WORKS
		//showing events 				WORKS
		//alreadyEvent()				WORKS
		//acceptbrewski()				WORKS
		console.log(AppFactory.userEvent);

		$scope.pending = false;

		$scope.init = function(){
			$scope.setDisable();  // Get correct value for whether brewski button works
			$scope.getLocation();   // Ask user for permission to use location for best UI experience
			$scope.checkEvents();
			$scope.getUsername();  // fetch events for timeline
			console.log("AppFactory.userEvent", AppFactory.userEvent);
		}

		//WORKS
		$scope.getUsername = function(){
			$http({
				method: 'GET',
				url: '/user'
			}).then(function(success){
				AppFactory.userId = success.data.id;
			}, function(err){
				console.log(err, "ERROR: COULD NOT GET USERNAME! INSIDE getUsername");
			})
		}

		$scope.isDisabled = false; //NEEDS TO BE ROOT SCOPE EVENTUALLY OR FACTORY

		$scope.events = []; //LIST OF EVENTS (SHOULD BE UPDATED CONSTANTLY WITH $INTERVAL)

		$scope.checkEvents = function(){
			// console.log("checkingEvents() 1st line");
			return $http({
				method: 'GET',
				url: '/events'
				// , data: {order: "-createdAt"}
			})
			.then(function(success){
				$scope.events = success.data.results;
				console.log("after GET req to /events, success.data.results:", success.data.results);
			}, function(err){
				console.log(err);
			});
		}

		$scope.setDisable = function(){
			if(AppFactory.userEvent && AppFactory.userEvent.accepted === false){
				$scope.isDisabled = true;
				$scope.pending = true;
				console.log("inside set Disable");
			} else {
				$scope.isDisabled= false;
			}
			// $scope.isDisabled = !$scope.isDisabled;
			// if(!$rootScope.userEvent){
			// 	$scope.isDisabled = false;
			// }
			// else if($rootScope.userEvent && $rootScope.userEvent.status === inactive){
			// 	$scope.isDisabled = true;
			// } else if ($rootScope.userEvent && $rootScope.userEvent.status === active){
			// 	$scope.isDisabled = false;
			// }
		};

		$scope.brew = function() {
		  // if (AppFactory.userEvent !== 0) { //if no brewski event hosted/accepted
		    $scope.isDisabled = true;
		    $scope.getLocation().then(function(result) {
		      console.log("result of invite()", result, result.coords.latitude);
		      $http({
		        method: 'POST',
		        url: '/events',
		        data: {
		          ownerLat: result.coords.latitude,
		          ownerLong: result.coords.longitude
		          //, eventType: 1
		        }
		      }).then(function(success) {
		        AppFactory.userEvent = success.data;
		        console.log("Success: owner lat/long sent");
		      }, function(err) {
		        console.log("Failure: owner lat/long not sent");
		      }).finally(function() {
		        $scope.setDisable();
		      });
		    });
		    // if userEvent exists and that event is accepted
			// } else {
			// 	$scope.setDisable();
			// 	console.log("setDisable inside", $scope.isDisable);
			// }
		}

		$scope.goToEvent = function() {
			$http({
		      method: 'GET',
		      url: '/events/' + AppFactory.userEvent.id
		    })
			.then(function(success) {
		      $location.path("/event");
		    }, function(err) {
		      console.log(err, "brew() ERROR: $rootScope.userEvent was accepted but something broke");
		    });
		};

		//IF YOU CREATE A BREWSKI YOU HAVE ALREADY CREATED A
		$scope.alreadyEvent = function(){
			if(AppFactory.userEvent){
				return ", but you already have an event bro!";
			}else{
				return " ";}
			};

		$scope.acceptBrewski = function(event){

			console.log("acceptBrewski() beginning");

			$scope.getLocation().then(function(success){

			$http({
				method: 'POST',
				url: '/events/' + event.id,
				data: {
					id: event.id,
					acceptedLat: success.coords.latitude,
					acceptedLong: success.coords.longitude
				}
			}).then(function(success){
					console.log(success);

					$http({
						method: 'GET',
						url: '/events/' + event.id,
					}).then(function(success){
						AppFactory.userEvent = success.data.results[0];
						console.log("inside acceptbrewski(). AppFactory.userEvent = ", success.data.results[0]);
						$location.path("/event");
					}, function(err){
						console.log("GET REQUEST FAILED FOR EVENTS PAGE AFTER PRESSING ACCEPT BREWSKI");
					});
				}, function(err){
					console.log("INSIDE BAD POST", err);
				});
			},function(err){
				alert("Stop playing a game of Marco Brolo. We need your location!");
			});

		};

		// $scope.bro = function(){

		// 	return $http({
		// 		method: 'POST',
		// 		url: '/events',
		// 		data: {
		// 			eventType: 2
		// 		}
		// 	}).then(function(success){
		// 		console.log(success);
		// 	}, function(err){
		// 		console.log(err);
		// 	})

		// };

		$scope.getLocation = function(){
			var deferred = $q.defer();

			if (!$window.navigator.geolocation) {
				deferred.reject("Geolocation not supported");
			} else {
				$window.navigator.geolocation.getCurrentPosition(function(position){
					deferred.resolve(position);
				}, function(err){
					deferred.reject(err);
				});
			}
			// console.log("deferred.promise", deferred.promise);
			return deferred.promise;
		};



		$scope.init();

		console.log("scope.events", $scope.events);

	});
