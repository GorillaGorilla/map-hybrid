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
    var locationEvent = function(err, lastLocation){
      // format =  { gameId: '2da1e608-36e4-434f-bcd5-6b31aa64a85f',
        // location: { username: 'Test', x: -0.05667340000002241, y: 51.538354 } }
      var obj = lastLocation ? {username : UserGameIds.getUsername(), x : lastLocation.lng(), y: lastLocation.lat()} : {username : UserGameIds.getUsername(), x : Location.getX(), y: Location.getY()} ;
        console.log('location event', obj);
        Socket.emit('location', {gameId: UserGameIds.getGameId(), location: obj});
    };
    $scope.UI_STATE = 'VIEW';  //view, send_bomber, send_AA

  $scope.state = "";
  $scope.playerHealth = 100;

  var delayPositionCall = function(){
    if(!locationQueued){

      setTimeout(function(){
        locationEvent();
      }, 45000);
      locationQueued = true;
    }
  };


  if(Location.currentLocation()){
    locationEvent();
  }else{
    Location.getPosition();
  }

  Location.init();


  $scope.sendBomber = function(){
    console.log("send Bomber");
    var targetLatLng = Renderer.getTarget();
    var obj = { gameId: UserGameIds.getGameId(),
      input:{username: UserGameIds.getUsername(),
        action: 'SEND_BOMBER',
        target: {x: targetLatLng.lng(), y: targetLatLng.lat()}}};
    Socket.emit('gameInputMessage',obj);
    UIState.setViewState();
  };

    $scope.sendAABattery = function(){
        console.log("send Battery");
        var targetLatLng = Renderer.getTarget();
        var obj = { gameId: UserGameIds.getGameId(),
            input:{username: UserGameIds.getUsername(),
                action: 'SEND_BATTERY',
                destination: {x: targetLatLng.lng(), y: targetLatLng.lat()}}};
        Socket.emit('gameInputMessage',obj);
      UIState.setViewState();
    };

  //Wait until the map is loaded


  locationEvent();  // used to be in 'wait for map idle event..'

    $scope.setViewState = function(){
        UIState.setViewState();
      Renderer.renderTargetFinder({
            strokeOpacity: 0,
            fillOpacity: 0
        });
    };

  Socket.on('control points', function(data){
    console.log('control points event', data);
    controlPoints = data.points;
    Renderer.setCPs(controlPoints);
  });

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
    // delayPositionCall();  revoed as now sending positions from within location service

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
