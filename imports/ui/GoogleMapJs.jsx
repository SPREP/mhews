import React, { PropTypes } from 'react';
import { Random } from 'meteor/random';
import { createContainer } from 'meteor/react-meteor-data';

const map_div_id = "map_canvas";

class GoogleMap extends React.Component {
  componentDidMount() {
//    GoogleMaps.load(this.props.options || {});
    GoogleMaps.load({v: '3', key: 'AIzaSyARRdFTy8sB6r94FgWHv0Ke_69MdBKkuoQ'});
  }

  componentDidUpdate() {
    if (this.props.loaded) {
      this.name = Random.id();

      GoogleMaps.create({
        name: this.name,
        element: this.container,
        options: {
//          center: this.props.mapCenter,
//          zoom: this.props.zoom,
          center: new google.maps.LatLng(-37.8136, 144.9631),
          zoom: 8,
        }
      });

      this.props.onReady(this.name);
    }
  }

  componentWillUnmount() {
    if (GoogleMaps.maps[this.name]) {
      google.maps.event.clearInstanceListeners(GoogleMaps.maps[this.name].instance);
      delete GoogleMaps.maps[this.name];
    }
  }

  addMarker(position, title, snippet){
    let latlng = this.googleLatLng(position);
    let marker = new google.maps.Marker( {
      map: this.map,
      position: latlng
    });
    let infoWindow = new google.maps.InfoWindow({
      content: title + " " + snippet,
      position: latlng
    })
    infoWindow.open(map);
  }

  addCircle(position, radius, color){
    let circleOption = {
      center: this.googleLatLng(position),
      radius: radius,
      map: this.map,
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
    }
    let circle = new google.maps.Circle(circleOption);
  }

  render() {
    return (
      <div className="map-container" ref={c => (this.container = c)}>
        {this.props.children}
      </div>
    );
  }
};
/*
GoogleMap.propTypes = {
  loaded: PropTypes.bool.isRequired,
  onReady: PropTypes.func.isRequired,
  options: PropTypes.object,
  mapOptions: PropTypes.func.isRequired,
  children: PropTypes.node,
};
*/

GoogleMapContainer = createContainer(() => ({ loaded: GoogleMaps.loaded() }), GoogleMap);

export default GoogleMapContainer;
