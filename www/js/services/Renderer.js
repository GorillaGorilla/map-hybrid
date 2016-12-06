/**
 * Created by frederickmacgregor on 06/12/2016.
 */
angular.module('map').service('Renderer', function(GameState){
  var map = null;
  var setMap = function(newMap){
    map = newMap;
  };
  var getMap = function(){
    return this.Map;
  };
  function render(){

  };
  return {
    getGameState: getMap,
    setGameState: setMap,
    render: render
  };
});
