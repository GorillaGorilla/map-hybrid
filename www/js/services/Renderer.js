/**
 * Created by frederickmacgregor on 06/12/2016.
 */
angular.module('starter').service('Renderer', function(GameState, UserGameIds, Socket){
  var map = null,
    markers = [],
    cpMarkers = [],
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

  var cpState = false;

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
      var assetLatLng = new google.maps.LatLng(asset.y, asset.x);
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
    var tempLatLng = new google.maps.LatLng(player.y, player.x);
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
      zoom: 10,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    // var div = document.getElementById("map");

    // Initialize the map view
    // map = plugin.google.maps.Map.getMap(div);
    var requested = false;
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    google.maps.event.addListenerOnce(map, 'idle', function(){
      initTargetFinder();

      map.addListener('zoom_changed', function(){
        console.log('zoom_changed');
        if(cpMarkers.length === 0 && !requested){
          requested = true;
          console.log('emitting request for cp state');
          Socket.emit('control point state');
          setTimeout(function(){requested = false;},7500);
          return;
        }
        console.log('map.getZoom()', map.getZoom(), cpState);
        if (map.getZoom() >= 13 && cpState === false){
          console.log('setting map true');
          cpMarkers.forEach(function(mark){
            mark.setMap(map);
          });
          cpState = true;
        }else if (map.getZoom() < 13 && cpState === true){
          console.log('setting map false');
          cpMarkers.forEach(function(mark){
            mark.setMap(null);
          });
          cpState = false;
        }
      });


    });
    return map;
  };


  function addCP(location, infoWindow, icon) {
    //accepts a LatLng obj and a path to the correct icon image
    var opts = {
      position: location,
      map: null
    };
    if (icon){
      opts.icon = icon;
    }
    var marker = new google.maps.Marker(opts);

    marker.addListener('click', function() {
      infoWindow.open(map, marker);
    });
    cpMarkers.push(marker);
  }

  function setCPs(controlPoints){
    controlPoints.forEach(function(cp) {
      var cpLatLng = new google.maps.LatLng(cp.y, cp.x);
      var infowindow = new google.maps.InfoWindow({
        content: createContentString(cp)
      });
      addCP(cpLatLng, infowindow);
    });
  }

  function createContentString(cp){
    var timeToNext = cp.frequencyOfVisits - (Date.now() - cp.lastVisitedTime);
    var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">' + cp.name + '</h1>'+
      '<div id="bodyContent">'+ (cp.owner ? ('<p>Controlled by ' +  cp.owner + '</p>') : '<p>Uncaptured</p>') +
      '<p><b>Health: </b>,' + cp.health + '</p><br>'+
      '<p><b>Next visitable: </b> '+ '' + ((timeToNext < 0) || !cp.lastVisitedTime ? ' Now.' : + (timeToNext/1000) + ' seconds') + '</p><br>'+
      '</div>'
        ;

    return contentString;
  }



  return {
    initMap: initMap,
    getGameState: getMap,
    setGameState: setMap,
    render: render,
    initTargetFinder: initTargetFinder,
    renderTargetFinder: renderTargetFinder,
    setCPs : setCPs,
    cpMarkers: cpMarkers
  };
});
