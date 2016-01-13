angular.module('App.event',[])
	.controller('EventController', function ($scope, $http, $rootScope, AppFactory) {


$rootScope.event = {
  "id": 1,
  "acceptedAt": 1452707607369,
  "acceptedId": 7,
  "eventType": null,
  "ownerName": "daniel",
  "acceptedName": "davidiscool",
  "active": false,
  "accepted": true,
  "ownerLat": 34.016197,
  "ownerLong": -118.4642734,
  "acceptedLat":  34.019197,
  "acceptedLong": -118.4842734,
  "centerLat": 34.017697,
  "centerLong": -118.4742734,
  "createdAt": "2016-01-13T17:50:46.000Z",
  "updatedAt": "2016-01-13T17:50:46.000Z",
  "deletedAt": null,
  "UserId": 5
}

//$root.Scope.event needs to be changed to appFactory.userEvent
    $scope.event = {
      centerLat: $rootScope.event.centerLat,
      centerLong: $rootScope.event.centerLong,
      startLat: $rootScope.event.ownerLat,
      startLong: $rootScope.event.ownerLong,
      endLat: 34.019038,
      endLong: -118.494917,
      ownerName: $rootScope.event.ownerName,
      acceptedName: $rootScope.event.acceptedName,
      party: 'get together'
    };

    if (1 !== $rootScope.event.UserId) {
      $scope.event.startLat = $rootScope.event.acceptedLat;
      $scope.event.startLong = $rootScope.event.acceptedLong;
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
        $scope.barInfo = result.data;
        $scope.event.endLat = result.data.location.latitude;
        $scope.event.endLong = result.data.location.longitude;
        $scope.getUber($scope.event.startLat, $scope.event.startLong, $scope.event.endLat, $scope.event.endLong);
      })
    }

    $scope.getYelp($scope.event.centerLat, $scope.event.centerLong);

    var party = [
      'turn up',
      'party hard',
      'get crazy',
      'blow this popsicle stand',
      'go dranking',
      'get messy',
      'get lit',
      'party hardy',
      'get ratchet',
      'bash',
      'rage up',
      'session down',
      'blowout',
      'kickback',
      'get happening'
    ]

    // $scope.event.party = party[_.random(0,14)]

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
	})
