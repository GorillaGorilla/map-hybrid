/**
 * Created by frederickmacgregor on 21/12/2016.
 */
angular.module('starter').controller('ChatCtrl', function($scope, Socket, $state, UserGameIds){
  $scope.messages = [];
  $scope.message =  {text : ""};


  Socket.on('new message', function(data){
    console.log('new message received');
    $scope.messages.push(data);
  });

  $scope.send = function(){
    console.log('send message', $scope.message.text);
    Socket.emit('new message', {
      gameId : UserGameIds.getGameId(),
      username: UserGameIds.getUsername(),
      message: $scope.message.text
    });
    $scope.messages.push({username: UserGameIds.getUsername(),
      message: $scope.message.text});

    $scope.message = {text: ""};
  };

  Socket.on('all messages', function(data){
    data.messages.forEach(function(mess){
      $scope.messages.push(mess);
    })
  });

  Socket.emit('chat opened');

});
