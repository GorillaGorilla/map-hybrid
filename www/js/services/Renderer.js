/**
 * Created by frederickmacgregor on 06/12/2016.
 */
angular.module('starter').service('Renderer', function(GameState, UserGameIds, Socket){
  var map = null,
    markers = [],
    cpMarkers = [],
    explosionMap = [],
    hitboxMap = [],
    cpFilters = {},
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

  var clickTargetListener;

  var cpState = false;

  function initTargetFinder(){
    targetFinder = new google.maps.Circle({
      strokeColor: '#4286f4',
      strokeOpacity: 0.0,
      strokeWeight: 2,
      fillColor: '#4286f4',
      fillOpacity: 0.0,
      map: map,
      center: map.getCenter(),
      radius: 50
    });

    google.maps.event.addListener(map, 'center_changed', function(event) {
      // console.log('centre changed');
      if(targetFinder){
        // console.log('setting centre');
        targetFinder.setOptions({
          center: map.getCenter()
        })
      }

      // if (UIState){
      //   cpMarkers.forEach(function(mark){
      //       mark.setMap(map);
      //   });
      // }


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
      hitboxMap[asset.id] ? updateHitbox(asset) : createHitbox(asset);
    });

    state.explosions.forEach(function(explosion){
      explosionMap[explosion.id] ? updateExplosion(explosion) : createExplosion(explosion);
    });

    deleteOldMarkers(state);
    // if(targetFinder){
    //   targetFinder.setOptions({
    //     center: map.getCenter()
    //   });
    // }
    // console.log('state after render',state);

  }

  function updateMarker(gameObject){
    markerMap[gameObject.id].setOptions({
      position : new google.maps.LatLng(gameObject.y, gameObject.x)
    });
  }

  function updateHitbox(gameObject){
    hitboxMap[gameObject.id].setOptions({
      center : new google.maps.LatLng(gameObject.y, gameObject.x)
    });
  }

  function createMarker(gameObject){
    // console.log('createMarker';
    var opts = {
      position: new google.maps.LatLng(gameObject.y, gameObject.x),
      map: map
    };
    var icon;
    var infoWindow;

    if (gameObject.username){
      icon = icons[ gameObject.username === UserGameIds.getUsername() ? 'player' : 'enemy'];
    }else if(gameObject.type){
      console.log('gameObject.type', gameObject.type);
      icon = icons[gameObject.type];
      console.log('icon', icon);
    }

    infoWindow = new google.maps.InfoWindow({
      content: createContentString(gameObject)
    });

    if (icon){
      opts.icon = icon;
    }
    markerMap[gameObject.id] = new google.maps.Marker(opts);
    if (infoWindow){
      markerMap[gameObject.id].addListener('click', function() {
        infoWindow.open(map, markerMap[gameObject.id]);
      });
    }

  }

  function createHitbox(gameObj){
    hitboxMap[gameObj.id] = new google.maps.Circle({
      strokeColor: '#000000',
      strokeOpacity: 0.7,
      strokeWeight: 1,
      fillColor: '#000000',
      fillOpacity: 0.5,
      map: map,
      center: new google.maps.LatLng(gameObj.y, gameObj.x),
      radius: gameObj.radius
    });
  }

  function createExplosion(explosion){

    console.log('drawing explosion', explosion);
    console.log('map', map);
    explosionMap[explosion.id] = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.7,
      strokeWeight: 1,
      fillColor: '#FF0000',
      fillOpacity: 0.7*(explosion.fuse/explosion.initialFuse),
      map: map,
      center: new google.maps.LatLng(explosion.y, explosion.x),
      radius: explosion.radius
    });
    console.log('')
  };

  function updateExplosion(explosion){
    explosionMap[explosion.id].setOptions({
      center: new google.maps.LatLng(explosion.y, explosion.x),
      fillOpacity: 0.7*(explosion.fuse/explosion.initialFuse)
    });
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
    for (var m in explosionMap){
      if (explosionMap[m]){
        if(!stateContains(state, m)){
          console.log('m', m);
          console.log('explosionMap[m]', explosionMap[m]);
          explosionMap[m].setMap(null);
          delete explosionMap[m];
        }
      }
    }

    for (var m in hitboxMap){
      if (hitboxMap[m]){
        if(!stateContains(state, m)){
          console.log('m', m);
          console.log('hitboxMap[m]', hitboxMap[m]);
          hitboxMap[m].setMap(null);
          delete hitboxMap[m];
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
    if (found){
      return true;
    }
    found = state.explosions.some(function(a){
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

  // function renderPlayer(player){
  //   // console.log('render player');
  //   var tempLatLng = new google.maps.LatLng(player.y, player.x);
  //   if (player.username === UserGameIds.getUsername()){
  //
  //     addMarker(tempLatLng, icons['player']);
  //   }else{
  //     addMarker(tempLatLng, icons['enemy'])
  //   }
  // }

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

  function addTouchListener(){
    if(targetFinder){

      clickTargetListener = google.maps.event.addListener(map, 'click', function(event) {
        console.log('click event', event.latLng);
        targetFinder.setOptions({
          center : event.latLng
        })
      });
    }

  }


  function removeClickTargeting(){
    google.maps.event.removeListener(clickTargetListener);
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
      var infoWindow = new google.maps.InfoWindow({
        content: createContentString(cp)
      });
      addCP(cpLatLng, infoWindow);
    });
  }

  function createContentString(cp){
    if (cp.type === 'BOMBER' || cp.type === 'MOBILE_AA'){
      var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">' + cp.type + '</h1>'+
        '<div id="bodyContent">'+ (cp.owner ? ('<p>Owned by ' +  cp.owner + '</p>') : '<p>Rogue</p>') +
        '<p><b>Health: </b>' + cp.health + '</p><br>'+
        '</div>';
      return contentString;
    }else if ((cp.username)){
      var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">' + cp.username + '</h1>'+
        '<div id="bodyContent">'+ '<p><b>Points</b></p>' + cp.points +
        '<p><b>Health: </b>' + cp.health + '</p><br>'+
        '</div>';
      return contentString;
  }else {


    }

    var timeToNext = cp.frequencyOfVisits - (Date.now() - cp.lastVisitedTime);
    var contentString = '<div id="content">'+
      '<div id="siteNotice">'+
      '</div>'+
      '<h1 id="firstHeading" class="firstHeading">' + cp.name + '</h1>'+
      '<div id="bodyContent">'+ (cp.owner ? ('<p>Controlled by ' +  cp.owner + '</p>') : '<p>Uncaptured</p>') +
      '<p><b>Health: </b>' + cp.health + '</p><br>'+
      '<p><b>Next visitable: </b> '+ '' + ((timeToNext < 0) || !cp.lastVisitedTime ? ' Now.' : + (timeToNext/60000) + ' minutes') + '</p><br>'+
      '</div>';

    return contentString;
  }


  function getTarget(){
    return targetFinder.getCenter();
  }


  function setMarkerFilter(){


  };


  return {
    initMap: initMap,
    getGameState: getMap,
    setGameState: setMap,
    render: render,
    initTargetFinder: initTargetFinder,
    renderTargetFinder: renderTargetFinder,
    setCPs : setCPs,
    cpMarkers: cpMarkers,
    setClickTargeting :addTouchListener,
    removeClickTargeting : removeClickTargeting,
    getTarget: getTarget
  };
});
