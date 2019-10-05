'use strict';

function initMap() {
  var map = new google.maps.Map(document.getElementById("map"),{
    center: {lat: 59.939653, lng: 30.314408},
    scrollwheel: false,
    zoom: 16,
    mapTypeControl: false
  });

  var image = "img/marker.png";
  var myLatLng = new google.maps.LatLng(59.938674, 30.324408);
  var beachMarker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    icon: image
  });
}