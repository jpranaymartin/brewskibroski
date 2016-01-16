angular.module('App.settings',[])
.controller('SettingsController', function($scope, $http, AppFactory){
  $scope.username = AppFactory.username;

  $scope.potentialFriend;
  $scope.friends = [];

  $scope.logout = function(){
    console.log("Loggout out");
    return $http ({
      method: 'GET',
      url: '/logout',
    })
    .then(function(success){
      console.log(success);
      window.location.replace('/');
    }, function(err){
      console.log(err);
    })
  };

  $scope.addFriend = function(){
    console.log("Adding a new friend");
    return $http ({
      method: 'POST',
      url: '/friends',
      data: {
        "friend": $scope.potentialFriend
      }
    })
    .then(function(success){
      console.log(success);
      $scope.getFriends();
    }, function(err){
      console.log(err);
    }).finally(function(){
      $scope.potentialFriend = "";
    });
  };

  $scope.getFriends = function(){
    console.log("Getting list of friends");
    return $http ({
      method: 'GET',
      url: '/friends',
    })
    .then(function(success){
      console.log(success);
      $scope.friends = success.data.friends;
    }, function(err){
      console.log(err);
    })
  };

  $scope.getFriends();

})
