import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';
import { createContainer } from 'meteor/react-meteor-data';

/* global google */
/* global GoogleMaps */

function googleLatLng(position){
  return new google.maps.LatLng(position.lat, position.lng);
}

class GoogleMap extends React.Component {
  componentDidMount() {
    const apiKey = Meteor.settings.public.googleMapsApiKey;
    if( apiKey ){
      GoogleMaps.load({v: '3', key: apiKey});

      if (this.props.loaded) {
        // Draw the google map here, because the componentDidUpdate() won't be called.
        this.createGoogleMaps();
      }
    }
    else{
      console.error("API key for the Google Maps hasn't been configured in the settings.json file.");
      console.error("Cannot load the google map.");
    }
  }

  createGoogleMaps(){

    this.name = this.props.name;

    GoogleMaps.create({
      name: this.name,
      element: this.container,
      options: {
        center: this.props.mapCenter,
        zoom: this.props.zoom,
      }
    });

    if( this.props.onReady ){
      GoogleMaps.ready(this.name, map => {
        this.map = map;
        this.props.onReady(this);
      });
    }
  }

  componentDidUpdate() {
    this.createGoogleMaps();
  }

  componentWillUnmount() {
    if (GoogleMaps.maps[this.name]) {
      google.maps.event.clearInstanceListeners(GoogleMaps.maps[this.name].instance);
      delete GoogleMaps.maps[this.name];
    }
  }

  addMarker(position, title, snippet){
    let latlng = googleLatLng(position);
    let marker = new google.maps.Marker( {
      map: this.map.instance,
      position: latlng
    });
    if( title ){
      let infoWindow = new google.maps.InfoWindow({
        // TODO Make a better presentation of the title and snippet.
        content: title + " " + snippet,
        position: latlng
      })
      infoWindow.open(this.map.instance, marker);
    }

    this.marker = marker;
  }
  addInfoWindow(position, title, snippet){
    let latlng = googleLatLng(position);
    let infoWindow = new google.maps.InfoWindow({
      content: title + " " + snippet,
      position: latlng
    })
    infoWindow.open(this.map.instance);
  }
  addCircle(position, radius, color){
    let circleOption = {
      center: googleLatLng(position),
      radius: radius,
      map: this.map.instance,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
    }
    let circle = new google.maps.Circle(circleOption);

    this.circle = circle;
  }

  addPolygon(polygon, color){
    const path = polygon.map((point) => {
      return googleLatLng(point);
    });
    const option = {
      path: path,
      map: this.map.instance,
      geodesic: true,

      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
    }
    this.polygon = new google.maps.Polygon(option);
  }

  render() {
    return (
      <div className="map-container" ref={c => (this.container = c)}>
        {this.props.children}
      </div>
    );
  }
}

/*
GoogleMap.propTypes = {
  loaded: PropTypes.bool.isRequired,
  onReady: PropTypes.func.isRequired,
  options: PropTypes.object,
  mapOptions: PropTypes.func.isRequired,
  children: PropTypes.node,
};
*/
GoogleMap.propTypes = {
  loaded: React.PropTypes.bool,
  name: React.PropTypes.string,
  mapCenter: React.PropTypes.object,
  zoom: React.PropTypes.number,
  onReady: React.PropTypes.func,
  children: React.PropTypes.node
}


const GoogleMapContainer = createContainer(() => ({loaded: GoogleMaps.loaded(),name: Random.id()}), GoogleMap);

export default GoogleMapContainer;
