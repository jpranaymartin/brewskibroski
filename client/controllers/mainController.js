angular.module('App.main',[])
	.controller('MainController', function($http, $scope, $q, $window, $location, $rootScope, AppFactory, $timeout){

		$scope.checkUserEvents = function(){
			return $http({
				method: 'GET',
				url: '/user'
			}).then(function(success){
				// console.log("ASSS", success);
				if(success.data.currentEvent !== null){
					// console.log("success.data.results.currentEvent: ", success.data.currentEvent);
					return $http({
						method: 'GET',
						url: '/events/' + success.data.currentEvent
					}).then(function(success){
						// console.log("Inside 2nd GET request: success: ",success);
						AppFactory.userEvent = success.data[0];
						// console.log("AppFactory.userEvent:", AppFactory.userEvent);
					}, function(err){
						// console.log("error inside 2nd get request of checkUserEvents");
					});
				}
			}, function(err){
				// console.log("ERROR: Inside 1st GET request of checkUserEvents");
			}).finally(function(){
				$scope.setBrewskiButtonTextAndFunction();
				$scope.setEventButton();
			});
		};

		//|| success.data.currentEvent.id !== AppFactory.userEvent.id SAVING THIS JUST IN CASE

		$scope.generateBro = function() {
			var bros = [
			  "bro!",
			  "brohemith!",
			  "Broseph!",
			  "Lebro James!",
			  "Brohammad Ali!",
			  "bromeo!",
			  "Bromer Simpson!",
			  "broskee!",
			  "brohan!",
			  "Abroham Lincoln!",
			  "Bro-ntosaurus!",
			  "Brorack Brobama!",
			  "Brother Seamus!"
			];


			var key = Math.floor(Math.random() * bros.length);
			// console.log("key", key);

			// console.log("inside $scope.generateBro(BEFORE):", $scope.broMessage);
			$scope.broMessage = bros[key];
			// console.log("inside $scope.generateBro(AFTER):", $scope.broMessage);
		};

		$scope.setBrewskiButtonTextAndFunction = function(){
			if(!AppFactory.userEvent){
				$scope.brewskiButtonText = "Send Brewski";
				$scope.isDisabled = false;
			} else if (AppFactory.userEvent && AppFactory.userEvent.accepted === false){
				$scope.brewskiButtonText = "Brewski Pending";
				$scope.isDisabled = true;
			} else {
				$scope.brewskiButtonText = "New Brewski";
				// $scope.isDisabled = false;
			}
		};

		$scope.setEventButton = function(){
			if(AppFactory.userEvent && AppFactory.userEvent.accepted === false){
				$scope.eventButton = "Event unaccepted";
				$scope.eventButtonDisabled = true;
			} else if (AppFactory.userEvent && AppFactory.userEvent.accepted === true){
				$scope.eventButton = "Go To Event";
				$scope.eventButtonDisabled = false;
				$scope.pageLoadOrEventPending = false;
				//change event button function
			} else if (!AppFactory.userEvent){
				$scope.eventButton = "No Brewskis...";
			}
		}

		$scope.brewskiButtonText = "Brewski";// Brewski  or Brewski Pending or Go To Event

		$scope.broMessage = "bro!";

		$scope.showEvent = AppFactory.userEvent ? AppFactory.userEvent.accepted : false;

		console.log(AppFactory.userEvent);

		$scope.init = function(){
			$scope.checkUserEvents();
			// $scope.setBrewskiButtonTextAndFunction();
			// $scope.getLocation();
			$scope.setLocation();
			$scope.checkEvents();
			$scope.getUsername();
			console.log("AppFactory.userEvent", AppFactory.userEvent);
			console.log("isDisabled:", $scope.isDisabled);
		};

		$scope.getUsername = function(){
			$http({
				method: 'GET',
				url: '/user'
			}).then(function(success){
				console.log("inside getUsername, success after GET req: ", success);
				AppFactory.userId = success.data.id;
				AppFactory.username = success.data.username;
			}, function(err){
				console.log(err, "ERROR: COULD NOT GET USERNAME! INSIDE getUsername");
			});
		};

		$scope.pageLoadOrEventPending = true;
		$scope.eventButton = "checking for event...";
		$scope.eventButtonDisabled = true;

		$scope.isDisabled = false;

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
				// console.log("after GET req to /events, success.data.results:", success.data.results);
			}, function(err){
				console.log(err);
			});
		};


		$scope.brew = function(){
		  // if (AppFactory.userEvent !== 0) { //if no brewski event hosted/accepted
		  	if(!AppFactory.userEvent || (AppFactory.userEvent && AppFactory.userEvent.accepted === true)){
		  		//should change events text to not yet accepted;
          $scope.brewskiButtonText = "Brewski Pending";
  		  	$scope.isDisabled = true;
  		  	$scope.eventButton = "Event unaccepted";
  				$scope.eventButtonDisabled = true;
  				$scope.pageLoadOrEventPending = true;
          $scope.brewTimeout();

  		    // $scope.getLocation().then(function(result) {
  		    //   console.log("result of invite()", result, result.coords.latitude);
		      $http({
		        method: 'POST',
		        url: '/events',
		        data: {
		          ownerLat: AppFactory.locationLat,
		          ownerLong: AppFactory.locationLong,
		          eventType: 1
		        }
		      }).then(function(success) {
		        AppFactory.userEvent = success.data;
		        console.log("Success: owner lat/long sent");
		      }, function(err) {
		        console.log("Failure: owner lat/long not sent");
		      }).finally(function(){
		      	$scope.setBrewskiButtonTextAndFunction();
		      });
		    // });
		   } else {
		   	console.log("ERROR: INSIDE OF BREW()! AppFactory.userEvent exists && has not been accepted. Aka button hasn't been disabled");
		   }
		};

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

			// $scope.getLocation().then(function(success){

			$http({
				method: 'POST',
				url: '/events/' + event.id,
				data: {
					id: event.id,
					acceptedLat: AppFactory.locationLat,
					acceptedLong: AppFactory.locationLong
				}
			}).then(function(success){
					console.log(success);

					$http({
						method: 'GET',
						url: '/events/' + event.id,
					}).then(function(success){
						AppFactory.userEvent = success.data[0];
						console.log("inside acceptbrewski(). AppFactory.userEvent = ", success.data[0]);
						$location.path("/event");
					}, function(err){
						console.log("GET REQUEST FAILED FOR EVENTS PAGE AFTER PRESSING ACCEPT BREWSKI");
					});
				}, function(err){
					console.log("INSIDE BAD POST", err);
				});
			// },function(err){
			// 	alert("Stop playing a game of Marco Brolo. We need your location!");
			// });

		};

		$scope.bro = function(){
			$scope.generateBro();
      $scope.broTimeout();

			console.log("inside $scope.bro, scope.broMessage is:", $scope.broMessage);


			return $http({
				method: 'POST',
				url: '/events',
				data: {
					eventType: 2,
					message: $scope.broMessage
				}
			}).then(function(success){
				console.log(success);
			}, function(err){
				console.log(err);
			});

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
			// console.log("GETTING LOCATION deferred.promise", deferred.promise);
			return deferred.promise;
		};

    $scope.setLocation = function(){
      $scope.getLocation().then(function(result){
        AppFactory.locationLat = result.coords.latitude;
        AppFactory.locationLong = result.coords.longitude;
        console.log("SAVED LONG", AppFactory.locationLong, "LAT", AppFactory.locationLat);
      });
    };

    $scope.broNotification = false;

    $scope.broTimeout = function(){
      $scope.broNotification = true;
      if(noteTimeout){
        $timeout.cancel(noteTimeout);
        $scope.broNotification = false;
      }
      var noteTimeout = $timeout(function(){
        $scope.broNotification = false;
      }, 1280);
    };

    $scope.brewNotification = false;

    $scope.brewTimeout = function(){
      $scope.brewNotification = true;
      if(noteTimeout){
        $timeout.cancel(noteTimeout);
        $scope.brewNotification = false;
      }
      var noteTimeout = $timeout(function(){
        $scope.brewNotification = false;
      }, 1280);
    };

		$scope.init();

		// console.log("scope.events", $scope.events);

	});
