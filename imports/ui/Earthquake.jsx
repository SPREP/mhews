import React from 'react';

const Apia = {
  lat: -13.815605,
  lng: -171.780512
};

class GoogleMap extends React.Component {
  constructor(props){
    super(props);
    this.map = null;
    this.diasterEvent = null;
  }

  render(){
    const style = {width: 100 + "%", height:400 + "px"};
    console.log("Earthquake.render() ---------------");
    if( this.props.disasterEvent != null ){
      console.log("props.eventData = " + this.props.disasterEvent);
      this.disasterEvent = this.props.disasterEvent;
    }
    else{
      console.log("props.eventData is empty.");
      this.disasterEvent = null;
    }

    return (
      <div id="map_canvas" style={style} >
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

    let div = document.getElementById("map_canvas");

    // Initialize the map view
    this.map = plugin.google.maps.Map.getMap(div);

    // Wait until the map is ready status.
    this.map.addEventListener(plugin.google.maps.event.MAP_READY,
      () => {this.onMapReady()});
    }

    onMapReady(){

      this.moveToPosition();
    }

    moveToPosition(){

      console.log("Earthquake.moveToPosition.");

      if( !this.map ){
        console.log("Map is empty.");
        return;
      }

      let animationProps = {
        target: Apia,
        zoom: 13,
        //      tilt: 60,
        //      bearing: 140,
        duration: 5000
      };

      if( this.disasterEvent == null ){
        console.log("moveCamera 1 =======");
        this.map.moveCamera(animationProps);

      }
      else{
        const epicenter = {
          lat: this.disasterEvent.epicenter_lat,
          lng: this.disasterEvent.epicenter_lng
        };

        animationProps.target = epicenter;

        console.log("epicenter.lat = "+ epicenter.lat);
        console.log("epicenter.lng = "+ epicenter.lng);

        let markerProps = {
          position: epicenter,
          //        position: new plugin.google.maps.LatLng(this.disasterEvent.epicenter_lat, this.disasterEvent.epicenter_lng),
          title: this.disasterEvent.type,
          snippet: "MMI = "+this.disasterEvent.mmi,
        };

        console.log("Before moveCamera 2 =======");

        // Move to the position with animation
        this.map.moveCamera(animationProps);

        console.log("Before addMarker =======");
        // Add a maker
        this.map.addMarker(markerProps, (marker) => {
          console.log("addMarker =======");

          // Show the info window
          marker.showInfoWindow();
        });

      }

    }
  }

class EarthquakePage extends React.Component {

  constructor(props){
    super(props);
  }

  render(){
    console.log("EarthquakePage.disasterEvent = "+this.props.disasterEvent);
    return(
      <GoogleMap disasterEvent={this.props.disasterEvent} />
    );
  }
}

export default EarthquakePage;
