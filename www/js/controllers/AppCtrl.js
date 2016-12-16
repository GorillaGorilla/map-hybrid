/**
 * Created by frederickmacgregor on 14/12/2016.
 */
var app = angular.module('starter')
  .controller('AppCtrl', function($scope, $ionicModal, $state, $timeout, UIState, Socket, UserGameIds) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.screen = 'map';

    $scope.loginData = {};

    $scope.setBomberTargetingState = UIState.setBomberTargetState;

    $scope.setAATargetingState = UIState.setAATargetState;

    $scope.setViewState = UIState.setViewState;

    $scope.buyBomber = function(){
      var obj = { gameId: UserGameIds.getGameId(),
        input:{username: UserGameIds.getUsername(),
          action: 'BUY_BOMBER'}};
      Socket.emit('gameInputMessage',obj);
    };

    $scope.buyMobileAA = function(){
      console.log('buy AA');
      var obj = { gameId: UserGameIds.getGameId(),
        input:{username: UserGameIds.getUsername(),
          action: 'BUY_AA'}};
      Socket.emit('gameInputMessage',obj);
    };

    $scope.leaveGame = function(){
      Socket.emit('leave game');
      Socket.removeListener('gameState');
      AuthService.logout();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };

    $scope.goStats = function(){
      // $scope.screen = 'stats';   //seems to automatically replace menu with back screen
      $state.go('app.stats');
    };

    $scope.goMap = function(){
      $scope.screen = 'map';
      $state.go('app.game');
    };

  })
