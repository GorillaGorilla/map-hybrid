/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('starter').service('Location',function($cordovaGeolocation, Socket, UserGameIds){
  var lastLocation = null;
 var locationQueued = false;
  var locationEvent;

  var options = {timeout: 10000, enableHighAccuracy: true};

  var getPosition = function(){
    console.log('getting position');
    $cordovaGeolocation.getCurrentPosition(options).then(function(position){
      console.log("position got");
      var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        // alert('location gotten  ' + latLng.lat() + ' ' + latLng.lng());
      lastLocation = latLng;

    }, function(error){
      console.log("Could not get location", error);
    });
  };


  var currentLocation = function(){
    if (lastLocation){
      return lastLocation
    }else{
      return false;
    }
  };

  var getX = function(){
    if (lastLocation){
      return lastLocation.lng();
    }
    console.log('no location');

  };

  var getY = function(){
    if(lastLocation){
      return lastLocation.lat();
    }
    console.log('no location');
  };

  // setInterval()     //use this to update position? or set listener for change in position....
  //   setInterval(getPosition, 60000);

    var init = function(){

      var delayPositionCall = function(){
        //not used yet
        if(!locationQueued){
          locationQueued = true;
          setTimeout(function(){
            locationEvent();
            locationQueued = false;
          }, 45000);

        }
      };

      getPosition();
      function onSuccess(position) {
        lastLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        var obj = {username : UserGameIds.getUsername(), x : getX(), y: getY()} ;
        console.log('location event', obj);
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: obj});
      }

      // onError Callback receives a PositionError object
      //
      function onError(error) {
        console.log('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
      }

      // Options: throw an error if no update is received every 30 seconds.
      //
      var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

    };


var testFunc = function(){
      console.log('testFunc called');
  };



  return {
    currentLocation: currentLocation,
    getX : getX,
    getY : getY,
      getPosition : getPosition,
    init : init,
    testFunc : testFunc
  }
});
