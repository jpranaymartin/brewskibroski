angular.module('App.main',[])
	.controller('MainController', function($http, $scope, $q, $window, $location, $rootScope){


		$scope.isDisabled = false; //NEEDS TO BE ROOT SCOPE EVENTUALLY OR FACTORY

		$scope.toggleDisable = function(){
			$scope.isDisabled = !$scope.isDisabled;
		}

		// $scope.brew = function() {

		// 	//if user does not own an event and if they haven't accepted an event

		// 	$scope.getLocation().then(function(result){
		// 		console.log("result of invite()", result, result.coords.latitude);
		// 		// $scope.toggleDisable();
		// 		$http({
		// 			method: 'POST',
		// 			url: '/event',
		// 			data: {
		// 				ownerLat: result.coords.latitude,
		// 				ownerLong: result.coords.longitude,
		// 				eventType: 1
		// 			}
		// 		}).then(function(success){
		// 			$rootScope.userEventId = success.id;
		// 			console.log("Success: owner lat/long sent");
		// 		}, function(err){
		// 			console.log("Failure: owner lat/long not sent");
		// 			$scope.toggleDisable();
		// 		});
		// 	});

		// 	//if user owns an event or if they have accepted event the button now takes them to their event

		// 	$http({
		// 		method: 'GET',
		// 		url: '/events/' + $rootscope.userEventId
		// 	}).then(function(success){
		// 		console.log(success, "Inside GET for BREW() aka GO TO EVENT");
		// 	}, function(err){
		// 		console.log(err, "GET for BREW() aka GO TO EVENT errored");
		// 	})



		// };


		

		$rootScope.userEventId = null;



		$scope.alreadyEvent = function(){
			if($rootScope.userEventId){return ", but you already have an event!";}else{return " ";}}





		$scope.acceptBrewski = function(event){

			$scope.getLocation().then(function(success){
			
			$http({
				method: 'POST',
				url: '/eventaccept',
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
						$location.path("/event");
					}, function(err){
						console.log("GET REQUEST FAILED FOR EVENTS PAGE AFTER PRESSING ACCEPT BREWSKI");
					})


				}, function(err){
					console.log("INSIDE BAD POST", err);
				});
			},function(err){
				alert("Stop playing a game of Marco Brolo. We need your location!");
			});

		};


		$scope.bro = function(){

			return $http({
				method: 'POST',
				url: '/createevent',
				data: {
					eventType: 2
				}
			}).then(function(success){
				console.log(success);
			}, function(err){
				console.log(err);
			})

		};

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
			console.log("deferred.promise", deferred.promise);
			return deferred.promise;
		};


		$scope.addEventsToTimeline = function(data){
			//
		}

		$scope.brewskisArray = [
    {
      "id": 1,
      "acceptedAt": "1452617593463",
      "acceptedId": 1,
      "eventType": 1,
      "ownerName": "Daniel",
      "acceptedName": "broseph",
      "active": false,
      "accepted": true,
      "ownerLat": 34.341895,
      "ownerLong": -118.1443,
      "acceptedLat": 34.432131,
      "acceptedLong": -118.4341621,
      "centerLat": 34.387012999999996,
      "centerLong": -118.28923105,
      "createdAt": "2016-01-12T16:40:45.000Z",
      "updatedAt": "2016-01-12T16:53:13.000Z",
      "deletedAt": null,
      "UserId": 2,
      "username": "broseph"
    },
    {
      "id": 3,
      "acceptedAt": "1452620856337",
      "acceptedId": 1,
      "eventType": 1,
      "ownerName": "broseph",
      "acceptedName": "broseph",
      "active": false,
      "accepted": true,
      "ownerLat": 34.341895,
      "ownerLong": -118.1443,
      "acceptedLat": 34.432131,
      "acceptedLong": -118.4341621,
      "centerLat": 34.387012999999996,
      "centerLong": -118.28923105,
      "createdAt": "2016-01-12T17:46:03.000Z",
      "updatedAt": "2016-01-12T17:47:36.000Z",
      "deletedAt": null,
      "UserId": 1,
      "username": "Daniel"
    },
    {
      "id": 4,
      "acceptedAt": null,
      "acceptedId": null,
      "eventType": 2,
      "ownerName": "broseph",
      "acceptedName": null,
      "active": true,
      "accepted": false,
      "ownerLat": 34.31895,
      "ownerLong": -118.443,
      "acceptedLat": null,
      "acceptedLong": null,
      "centerLat": null,
      "centerLong": null,
      "createdAt": "2016-01-12T18:06:31.000Z",
      "updatedAt": "2016-01-12T18:06:31.000Z",
      "deletedAt": null,
      "UserId": 1,
      "username": "thecoolestbro"
    }
  ]


  // 		console.log($scope.timelineArray);

		// //
		// $scope.events;


		// $scope.init = function(){
		// 	$scope.getLocation();
		// 	$interval($scope.check, 5000);
		// }
		
		// $scope.init();

		//GOES INTO APP FACTORY!!!!!!!!!
		$rootScope.friends = [
			{id: 1, username: "dustin"},
			{id: 2, username: "test"}
		];
		//GOES INTO APP FACTORY!!!!!!!!!
		$rootScope.events = [];

		
		// {
		// 	friends: [
		// 		{id: 1, username: "ariel"},
		// 		{id: 2, username: "jeff"}
		// 	]
		// }


		$scope.getFriends = function(){
			return $http({
				method: 'GET',
				url: '/friends',
			}).then(function(success){
				for(var i = 0; i < success.friends.length; i++){
					$rootScope.friends[success.friends[i].id] = success.friends[i].username;
				}
			}, function(err){
				console.log(err);
			})
		}



				// for(var i = 0; i < success.results.length; i++){
				// 	if($rootScope.friends[success.results[i].UserId]){
				// 		$scope.events.push(success.results[i]);
				// 	}
				// }


		$scope.checkEvents = function(){
			return $http({
				method: 'GET',
				url: '/eventslist'
				// , data: {order: "-createdAt"}
			})
			.then(function(success){
				$rootScope.events = success.results;
			}, function(err){
				console.log(err);
			});
		}



	});
