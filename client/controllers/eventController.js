angular.module('App.event',[])
  .controller('EventController', function ($scope, $http, AppFactory) {

    $scope.event = {
      centerLat: AppFactory.userEvent.centerLat,
      centerLong: AppFactory.userEvent.centerLong,
      startLat: AppFactory.userEvent.ownerLat,
      startLong: AppFactory.userEvent.ownerLong,
      ownerName: AppFactory.userEvent.ownerName,
      acceptedName: AppFactory.userEvent.acceptedName,
      party: 'get together'
    };

    if (AppFactory.userEvent.UserId !== AppFactory.userId) {
      $scope.event.startLat = AppFactory.userEvent.acceptedLat;
      $scope.event.startLong = AppFactory.userEvent.acceptedLong;
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
    ];

    // $scope.event.party = party[_.random(0,14)]

     $scope.getUber = function (startLat, startLong, endLat, endLong){
       $http({
         method: 'POST',
         url: '/uber',
         data: {
          startLat: startLat,
          startLong: startLong,
          endLat: endLat,
          endLong: endLong
         }
       })
       .then(function(result){
         console.log('Result from getUber: ', result.data);
         $scope.uber = result.data;

       })
     }
  })
