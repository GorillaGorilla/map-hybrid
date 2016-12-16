/**
 * Created by frederickmacgregor on 26/11/2016.
 */



angular.module('map').controller('MapCtrl', function($scope, $state, $cordovaGeolocation, Socket, Location, UserGameIds, GameState, Renderer, UIState) {
  console.log('loading map module');
  var options = {timeout: 10000, enableHighAccuracy: true},
    latLng = Location.currentLocation(),
    locationQueued = false,
    playerState,
    icons = {
        player: "img/player_icon.png",
        enemy: "img/colonel2.png",
        BOMBER: "img/plane.png",
        AA_TANK: "img/AA_TANK.png",
        FLAK: "img/FLAK.png"
    };
    var locationEvent = function(){
        console.log('location', Location.getX(), Location.getY());
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: {username : UserGameIds.getUsername(), x : Location.getX(), y: Location.getY()}});
    };
    $scope.UI_STATE = 'VIEW';  //view, send_bomber, send_AA

  $scope.state = "";
  $scope.playerHealth = 100;

  var delayPositionCall = function(){
    if(!locationQueued){
      setTimeout(function(){
        Location.getPosition(locationEvent());

      }, 45000);
      locationQueued = true;
    }
  };


  if(Location.currentLocation()){
    locationEvent();
  }else{
    Location.getPosition();
  }




  $scope.sendBomber = function(){
    console.log("send Bomber");
    var targetLatLng = $scope.map.getCenter();
    var obj = { gameId: UserGameIds.getGameId(),
      input:{username: UserGameIds.getUsername(),
        action: 'SEND_BOMBER',
        target: {x: targetLatLng.lat(), y: targetLatLng.lng()}}};
    Socket.emit('gameInputMessage',obj);
    UIState.setViewState();
  };

    $scope.sendAABattery = function(){
        console.log("send Battery");
        var targetLatLng = $scope.map.getCenter();
        var obj = { gameId: UserGameIds.getGameId(),
            input:{username: UserGameIds.getUsername(),
                action: 'SEND_BATTERY',
                destination: {x: targetLatLng.lat(), y: targetLatLng.lng()}}};
        Socket.emit('gameInputMessage',obj);
      UIState.setViewState();
    };

  //Wait until the map is loaded


  locationEvent();  // used to be in 'wait for map idle event..'

    $scope.setViewState = function(){
        $scope.UI_STATE = "VIEW";
      Renderer.renderTargetFinder({
            strokeOpacity: 0,
            fillOpacity: 0
        });
    };


  Socket.on('gameState', function(state){
    // console.log('game state', state);
    GameState.setGameState(state);
      var player = state.players.filter(function(play){
      return play.username === UserGameIds.getUsername();
    });

    $scope.playerHealth = player[0].health;
    $scope.state = player[0];
    $scope.UI_STATE =  UIState.getState();
    Renderer.render(state);
    delayPositionCall();

  });

  $scope.username = UserGameIds.getUsername();

  $scope.leaveGame = function(){
    Socket.emit('leave game');
    Socket.removeListener('gameState');
    AuthService.logout();
  };

  console.log('latLng', latLng);
  $scope.map = Renderer.initMap(latLng);

});


angular.module('map').controller('StatCtrl', function($scope, GameState){

  $scope.players = GameState.getGameState().players;

});
