angular.module('App.event',[])
	.controller('EventController', function ($scope, $http) {

    $scope.event = {
      centerLat: 34.048260, 
      centerLong: -118.433919,
      startLat: 34.048828,
      startLong: -118.429963,
      endLat: 34.019038,
      endLong: -118.494917
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
        console.log('Result from getYelp: ', result.data);
        $scope.stuff = result.data;
      })
    }

    $scope.getYelp($scope.event.centerLat, $scope.event.centerLong);
     

     $scope.getUber = function (startLat, startLong, endLat, endLong){
       $http({
         method: 'POST',
         url: '/uber',
         data: {
          startLat: startLat,
          startLong: startLong,
          endLat: endLat,
          endLong: endLong,
         }
       })
       .then(function(result){
          console.log('Result from getUber: ', result.data);
         $scope.uber = result.data;
       })
     }

     $scope.getUber($scope.event.startLat, $scope.event.startLong, $scope.event.endLat, $scope.event.endLong);
		
	})