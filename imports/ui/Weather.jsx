import React from 'react';
import {GridList, GridTile} from 'material-ui/GridList';
import ListItem from 'material-ui/List/ListItem';
import Avatar from 'material-ui/Avatar';

/**
 * This page should show the latest weather forecast.
 * The latest forecast should be retrieved from the SmartMet product.
 */

 export class WeatherPage extends React.Component {

   constructor(props){
     super(props);
     if( this.props.phenomena && this.validatePhenomena()){
       this.weather = this.props.phenomena;
     }
   }

   validatePhenomena(){
     return true;
   }

   render(){
     return(
       <div>
         <img src="images/weather/WeatherForecastBackground.png"/>
       </div>
     );
   }
 }


 /**
  * Usage: <WeatherTile onClick={callback} />
  * This GridTile requires two columns to display the latest weather observation.
  */
 export class WeatherMenuTile extends React.Component {
   constructor(props){
     super(props);
   }

   retrieveWeatherObservation(){
     // TODO This should be cached to avoid unnecessary server access.
     return {city: 'Apia', weather: 'Sunny', temperature: 25.3};
   }

   generateTitle(observation){
     return observation.city + " " + observation.temperature + "C";
   }

   getImageName(observation){
       return "images/weather/Sunny.png";
   }

   render(){
     const observation = this.retrieveWeatherObservation();

     return (
       <ListItem
         leftAvatar={<Avatar src={this.getImageName(observation)}></Avatar>}
         primaryText={this.generateTitle(observation)}
         onClick={() => this.props.onClick()}
         />
     )
   }
 }
