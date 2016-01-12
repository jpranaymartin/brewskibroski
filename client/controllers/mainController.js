angular.module('App.main',[])
	.controller('MainController', function($http, $scope, $q, $window){
		


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

		$scope.brew = function() {
		
			$scope.getLocation().then(function(result){
				console.log("result of invite()", result, result.coords.latitude);
				$http({
					method: 'POST',
					url: '/event',
					data: {
						ownerLat: result.coords.latitude,
						ownerLong: result.coords.longitude,
						eventType: 1
					}
				}).then(function(success){
					console.log("Success: owner lat/long sent");
				}, function(err){
					console.log("Failure: owner lat/long not sent");
				});
			});

		};


		$scope.check = function(){
			return $http({
				method: 'GET',
				url: '/eventslist'
			})
			.then(function(result){
				console.log("inside scope.check");
			})
		}



	})
