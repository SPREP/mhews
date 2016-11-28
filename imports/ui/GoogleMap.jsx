import React from 'react';

const map_div_id = "map_canvas";
const defaultZoom = 10;

/**
 * Wrapper for the google map cordova plugin, so that it can be used as a React component.
 */
class GoogleMap extends React.Component {
  constructor(props){
    super(props);
    this.map = null;
  }

  render(){
    const style = {width: 100 + "%", height:400 + "px"};

    return (
      <div id={map_div_id} style={style} >
      </div>
    );
  }

  componentDidMount() {
    console.log("Earthquake.componentDidMount.");
    this.initializeMapView();
  }

  componentDidUpdate() {
    console.log("Earthquake.componentDidUpdate.");
    this.initializeMapView();
  }

  initializeMapView(){

    let div = document.getElementById(map_div_id);

    // Initialize the map view
    this.map = plugin.google.maps.Map.getMap(div);

    // Wait until the map is ready status.
    this.map.addEventListener(plugin.google.maps.event.MAP_READY,
      () => {this.onMapReady()});
  }

  onMapReady(){
    if( !this.map ){
      console.error("Map is empty.");
      return;
    }

    if( this.props.onMapReady ){
      this.moveCamera(this.props.mapCenter, ()=>{this.props.onMapReady(this);});
    }
    else{
      this.moveCamera(this.props.mapCenter);
    }
  }

  moveCamera(position, callback){

    let animationProps = {
      target: position,
      zoom: this.props.zoom ? this.props.zoom : defaultZoom,
      duration: 5000
    };

    this.map.moveCamera(animationProps, callback);
  }

  addMarker(position, title, snippet){

    let markerProps = {
      position: position,
      title: title,
      snippet: snippet,
    };

    // Add a maker
    this.map.addMarker(markerProps, (marker) => {
      // Show the info window
      marker.showInfoWindow();
    });
  }

  addCircle(position, radius, color){
    this.map.addCircle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: color,
      fillOpacity: 0.35,
      center: epicenter,
      radius: radius
    });
  }
}

export default GoogleMap;
