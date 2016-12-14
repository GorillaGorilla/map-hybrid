/**
 * Created by frederickmacgregor on 06/12/2016.
 */
angular.module('starter').service('Renderer', function(GameState, UserGameIds){
  var map = null,
    markers = [],
  icons = {
    player: "img/player_icon.png",
    enemy: "img/colonel2.png",
    BOMBER: "img/plane.png",
    AA_TANK: "img/AA_TANK.png",
    FLAK: "img/FLAK.png"
  },
    targetFinder = null,
  setMap = function(newMap){
    map = newMap;
  };
  var width = 200,
    height = 200,
    radius = Math.min(width, height) / 2;

  var getMap = function(){
    return map;
  };

  function initTargetFinder(){
    targetFinder = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.0,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.0,
      map: map,
      center: map.getCenter(),
      radius: 50
    });
  }

  function render(){

    deleteMarkers();
    var state = GameState.getGameState();
    // console.log('state',state);
    state.players.forEach(function(player){
      renderPlayer(player);
      if(player.username === UserGameIds.username){
      }

    });
    state.assets.forEach(function(asset){
      var assetLatLng = new google.maps.LatLng(asset.x, asset.y);
      addAsset(assetLatLng, asset.type);
    });
    targetFinder.setOptions({
      center: map.getCenter()
    });

  }

  function renderTargetFinder (opts){
    targetFinder.setOptions(opts);
  }

  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);

    }
  }

  function renderPlayer(player){
    // console.log('render player');
    var tempLatLng = new google.maps.LatLng(player.x, player.y);
    if (player.username === UserGameIds.getUsername()){

      addMarker(tempLatLng, icons['player']);
    }else{
      addMarker(tempLatLng, icons['enemy'])
    }
  }

  function addMarker(location, icon) {
    //accepts a LatLng obj and a path to the correct icon image
    var opts = {
      position: location,
      map: map
    };
    if (icon){
      opts.icon = icon;
    }
    var marker = new google.maps.Marker(opts);
    markers.push(marker);
  }

  function addAsset(location, type){
    var image = icons[type];
    addMarker(location, image);
  }

  function deleteMarkers(){
    setMapOnAll(null);
    markers = [];
  }

  function initMap(latLng){
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function(){
      initTargetFinder();


    });
    return map;
  };

  var translation = {
    x: (width / 2),
    y: (height / 2)
  };

  var jsonCircles = [
    { "x_axis": 30, "y_axis": 30, "radius": 20, "color" : "green" },
    { "x_axis": 70, "y_axis": 70, "radius": 20, "color" : "purple"},
    { "x_axis": 110, "y_axis": 100, "radius": 20, "color" : "red"}];

  var svg = d3.select('ui-view').append("svg")
    .attr("width", width)
    .attr("height", height)
    // .attr("align", "right")
    // .attr("position", "absolute");
    // .append("g")
    // .attr("transform", "translate(" + translation.x + "," + translation.y + ")");
  //
  // var circles = svg.selectAll("circle")
  //                           .data(jsonCircles)
  //                           .enter()
  //                           .append("circle");
  var circle = svg.append("circle")
                           .attr("cx", 30)
                           .attr("cy", 30)
                          .attr("r", 20);

  // var svg = d3.select("body").append("svg")
  //   .fillColor('yellow')
  //   .classed("floatTL", true);

  return {
    initMap: initMap,
    getGameState: getMap,
    setGameState: setMap,
    render: render,
    initTargetFinder: initTargetFinder,
    renderTargetFinder: renderTargetFinder
  };
});
