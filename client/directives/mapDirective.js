angular.module('App.map',[])
  .directive("myMaps", function (AppFactory, $timeout) {
    return{
      restrict:'E', //Element Type
      template:'<div></div>', //Defining myApp div
      replace:true, //Allowing replacing
      link: function(scope, element, attributes){
        $timeout(function(){
        var startLat;  
        var startLong;
        var broLat;
        var broLong;

        if (AppFactory.userEvent.UserId !== AppFactory.userId) {
          startLat = AppFactory.userEvent.acceptedLat;
          startLong = AppFactory.userEvent.acceptedLong;
          broLat = AppFactory.userEvent.ownerLat;
          broLong = AppFactory.userEvent.ownerLong;
        } else {
          startLat = AppFactory.userEvent.ownerLat;
          startLong = AppFactory.userEvent.ownerLong;
          broLat = AppFactory.userEvent.acceptedLat;
          broLong = AppFactory.userEvent.acceptedLong;
        };

        var barLat = AppFactory.userEventLat;
        var barLong = AppFactory.userEventLong;

        var startLatLng = new google.maps.LatLng(startLat, startLong);
        var barLatLng = new google.maps.LatLng(barLat, barLong);
        var broLatLng = new google.maps.LatLng(broLat, broLong);

        // Helper function - find center position between 2 locations
        var getCentralPoints = function(ownerPoints, acceptedPoints, num) {
          var d0 = (acceptedPoints[0] - ownerPoints[0]) / (num + 1);
          var d1 = (acceptedPoints[1] - ownerPoints[1]) / (num + 1);
          var points = [];
          for (var i = 1; i <= num; i++) {
            points.push({
              x: ownerPoints[0] + d0 * i,
              y: ownerPoints[1] + d1 * i
            });
          }
          return points;
        };

        // Helper function - calculate distance between 2 locations in miles
        var distance = function (lat1, lon1, lat2, lon2, unit) {
          var radlat1 = Math.PI * lat1/180;
          var radlat2 = Math.PI * lat2/180;
          var radlon1 = Math.PI * lon1/180;
          var radlon2 = Math.PI * lon2/180;
          var theta = lon1-lon2;
          var radtheta = Math.PI * theta/180;
          var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
          dist = Math.acos(dist);
          dist = dist * 180/Math.PI;
          dist = dist * 60 * 1.1515;
          if (unit=="K") { dist = dist * 1.609344; }
          if (unit=="N") { dist = dist * 0.8684; }
          return dist;
        }

        // Calculate center point between user location and bar location
        // var mapPoints = getCentralPoints([startLat, startLong],[barLat, barLong], 1);
        // var mapLatLng = new google.maps.LatLng(mapPoints[0].x, mapPoints[0].y);

        var mapLatLng = new google.maps.LatLng(barLat, barLong);

        // Control zooming of map based on distance between user location and bar location
        var mapZoom;
        var mapDist = distance(startLat, startLong, broLat, broLong, 1);

        if(mapDist > 0 && mapDist < 0.75){
          mapZoom = 15;
        } else if(mapDist > 0.75 && mapDist < 1.5){
          mapZoom = 14;
        } else if(mapDist > 1.5 && mapDist < 3){
          mapZoom = 13;
        } else if (mapDist > 3 && mapDist < 6){
          mapZoom = 12;
        } else if (mapDist > 6 && mapDist < 12){
          mapZoom = 11;
        } else if (mapDist > 12 && mapDist < 24){
          mapZoom = 10;
        } else if (mapDist > 24 && mapDist < 48){
          mapZoom = 9;
        } else if (mapDist > 48 && mapDist < 96){
          mapZoom = 8;
        } else if (mapDist > 96 && mapDist < 192){
          mapZoom = 7;
        } else if (mapDist > 192 && mapDist < 384){
          mapZoom = 6;
        } else if (mapDist > 384 && mapDist < 768){
          mapZoom = 5;
        } else if (mapDist > 768 && mapDist < 1536){
          mapZoom = 4;
        } else if (mapDist > 1536 && mapDist < 3072){
          mapZoom = 3;
        } else if (mapDist > 3072 && mapDist < 6144){
          mapZoom = 2;
        } else if (mapDist > 6144){
          mapZoom = 1;
        }
        
        // Set Google map options
        var mapOptions = {
          center: mapLatLng,
          zoom: mapZoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById(attributes.id),
          mapOptions);

        // Set map markers at user location and bar location
        var startMarker = new google.maps.Marker({
          icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
          position: startLatLng,
          map: map,
          title:"You are here!"
        });
        var centerMarker = new google.maps.Marker({
          icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
          position: barLatLng,
          map: map,
          title:"Bar is here!"
        });
        var broMarker = new google.maps.Marker({
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          position: broLatLng,
          map: map,
          title:"Your bro is here!"
        });
          
        }, 3000);
      }
    };
});