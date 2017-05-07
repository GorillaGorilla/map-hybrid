/**
 * Created by frederickmacgregor on 26/11/2016.
 */
angular.module('login').service('UserGameIds', function(Socket){
  var username = null,
    gameId = null,
    userId = null,
    connected = false;
  var setUsername = function(name){
    // alert('setting username  ' +  name);
    username = name;
  };
  var getGameId = function(){
    return gameId;
  };

  var setGameId = function(id){
    gameId = id;
  };
  var getUsername= function(){
    return username
  };
  var isConnected = function(){
    return connected;
  };
  return {
    setUsername: setUsername,
    getGameId: getGameId,
    getUsername: getUsername,
    setGameId: setGameId,
    isConnected: isConnected
  };
});


angular.module('starter').service('UIState', function(Socket, Renderer){
  var state = 'VIEW';
  var setBatteryTargetingState = function(){
    state = "SEND_BATTERY";
    Renderer.renderTargetFinder({
      strokeOpacity: 0.8,
      fillOpacity: 0.2
    });

    Renderer.setClickTargeting();
  };

  var setBomberTargetingState = function(){
    state = "SEND_BOMBER";
    Renderer.renderTargetFinder({
      strokeOpacity: 0.8,
      fillOpacity: 0.2
    });

    Renderer.setClickTargeting();
  };

  var setViewState = function(){
    state = "VIEW";
    Renderer.renderTargetFinder({
      strokeOpacity: 0,
      fillOpacity: 0
    });

    Renderer.removeClickTargeting();

  };


  var selectPlayerState = function(playerId){
    state = "SELECTED_PLAYER";
    Renderer.setMarkerFilter(playerId);

  };

  var unselectPlayer = function(){

  };

  return {
    getState: function(){return state},
    setAATargetState: setBatteryTargetingState,
    setBomberTargetState: setBomberTargetingState,
    setViewState: setViewState,
    state: state
  };
});
