angular.module('App.event',[])
  .service('showAlertSrvc', ['$timeout', function($timeout) {
    return function(delay) {
      var result = {hidden:true};
      $timeout(function() {
        result.hidden=false;
      }, delay);
      return result;
    };
  }])
 .controller('EventController', function ($scope, $http, AppFactory, showAlertSrvc) {
    $scope.test = showAlertSrvc(3000);

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
       AppFactory.userEventLat = result.data.location.latitude;
       $scope.event.endLong = result.data.location.longitude;
       AppFactory.userEventLong = result.data.location.longitude;
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

   $scope.event.party = party[Math.floor(Math.random() * party.length)];

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