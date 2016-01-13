angular.module('App.event',[])
	.controller('EventController', function ($scope, $http) {

    $scope.event = {
      centerLat: 34.048260, 
      centerLong: -118.433919
    };

    $scope.getYelp = function (centerLat, centerLong){
      $http({
        method: 'POST',
        url: '/yelp',
        data: {
          centerLat: centerLat,
          centerLong: centerLong
        }
      })
      .then(function(result){
        console.log('Result from appfactory getyelp: ', result.data);
        $scope.stuff = result.data;
      })
    }

    $scope.getYelp($scope.event.centerLat, $scope.event.centerLong);
     
		
	})