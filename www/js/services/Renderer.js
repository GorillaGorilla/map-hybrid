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
    MOBILE_AA: "img/AA_TANK.png",
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

  obj = {
    id: 'xx24xxx',
    x : 1,
    y: 50,
    type: 'BOMBER'
  };

  var markerMap = {

  };

  function render(){

    deleteMarkers();  // needs to be changed to only delete markers for assets that no longer exist
    var state = GameState.getGameState();
    // console.log('state',state);

    state.players.forEach(function(player){
      markerMap[player.id] ? updateMarker(player) : createMarker(player);

    });
    state.assets.forEach(function(asset){
      markerMap[asset.id] ? updateMarker(asset) : createMarker(asset);
    });

    deleteOldMarkers(state);
    targetFinder.setOptions({
      center: map.getCenter()
    });

    console.log('state after render',state);


  }

  function updateMarker(gameObject){
    markerMap[gameObject.id].setOptions({
      position : new google.maps.LatLng(gameObject.y, gameObject.x)
    });
  }

  function createMarker(gameObject){
    var opts = {
      position: new google.maps.LatLng(gameObject.y, gameObject.x),
      map: map
    };
    var icon;
    if (gameObject.username){
      icon = icons[ gameObject.username === UserGameIds.getUsername() ? 'player' : 'enemy'];
    }else if(gameObject.type){
      icon = icons[gameObject.type];
    }

    if (icon){
      opts.icon = icon;
    }
    markerMap[gameObject.id] = new google.maps.Marker(opts);
  }

  function deleteOldMarkers(state){
    for (var m in markerMap){
      if (markerMap[m]){
        if(!stateContains(state, m)){
          console.log('m', m);
          console.log('markerMap[m]', markerMap[m]);
          markerMap[m].setMap(null);
          delete markerMap[m];
        }
      }

    }
  }

  function stateContains(state, id){
    var found= false;
    found = state.assets.some(function(a){
      return a.id === id;
    });
    if (found){
      return true;
    }
    found = state.players.some(function(a){
      return a.id === id;
    });
    return found;

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
