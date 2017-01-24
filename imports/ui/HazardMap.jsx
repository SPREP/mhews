import React from 'react';
import { GoogleMap, Marker, Circle, Polygon } from "react-google-maps";
import { withGoogleMap } from "react-google-maps";
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
import { createContainer } from 'meteor/react-meteor-data';

// Wrap all `react-google-maps` components with `withGoogleMap` HOC
// and name it GettingStartedGoogleMap
const HazardGoogleMap = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      ref={props.onReady}
      defaultZoom={props.zoom}
      defaultCenter={props.mapCenter}
      >
        {props.markers.map((marker, index) => (
          <Marker
            key={index}
            {...marker}
          />
        ))}
        {props.circles.map((circle, index) => (
          <Circle
            key={index}
            {...circle}
            options={{
              strokeColor: circle.color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: circle.color,
              fillOpacity: 0.35,
            }}
          />
        ))}
        {props.polygons.map((polygon, index) => (
          <Polygon
            key={index}
            {...polygon}
            options={{
              strokeColor: polygon.color,
              strokeOpacity: 0.8,
              strokeWeight: 2,
              fillColor: polygon.color,
              fillOpacity: 0.35,
            }}
          />
        ))}
      </GoogleMap>
    )
  )
);

HazardGoogleMap.propTypes = {
  loaded: React.PropTypes.bool,
  name: React.PropTypes.string,
  mapCenter: React.PropTypes.object,
  zoom: React.PropTypes.number,
  onReady: React.PropTypes.func,
  children: React.PropTypes.node,
  markers: React.PropTypes.array,
  circles: React.PropTypes.array,
  polygons: React.PropTypes.array
}

const HazardGoogleMapContainer = createContainer(({markers, circles, polygons})=>{
  const apiKey = Meteor.settings.public.googleMapsApiKey;

  return {
    googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3.exp&key="+apiKey,
    markers: markers ? markers : [],
    circles: circles ? circles : [],
    polygons: polygons ? polygons : []
  }

}, HazardGoogleMap);

class HazardMap extends React.Component {
  render(){
    return (
      <HazardGoogleMapContainer
        {...this.props}
        loadingElement={
          <div>Loading google map...</div>
        }
        containerElement={
          <div id="hazardMapContainer" style={{ height: '300px', width: '100%' }} />
        }
        mapElement={
          <div id="hazardMapElement" style={{ height: '300px', width: '100%'}} />
        }>
      </HazardGoogleMapContainer>
    )
  }
}

export default HazardMap;
