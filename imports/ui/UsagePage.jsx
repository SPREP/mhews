import React from 'react';

/* i18n */
import { translate } from 'react-i18next';


import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import RaisedButton from 'material-ui/RaisedButton';
import Card from 'material-ui/Card/Card';
import CardMedia from 'material-ui/Card/CardMedia';
import CardText from 'material-ui/Card/CardText';
import CardActions from 'material-ui/Card/CardActions';


import {playSoundNoDelay} from '../api/client/mediautils.js';

/* global device */

// Shows the usage when the user starts the app for the first time.
// 1) Alarm list
// 2) Weather forecast. Horizontally scrollable.
// 3) Menu at the left top corner.
// 4) Receive notification in the background

const pages = [
  {
    image: "toppage.jpg",
    text: "The app shows the weather forecast and alert list. If there's no alert in effect, a smile icon is displayed.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "weather_details.jpg",
    text: "The details of the weather forecast are displayed by tapping on the rectangle.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "weather_surface_chart.jpg",
    text: "By swiping on the image, you can see either the surface chart...",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "weather_satellite.jpg",
    text: "Or the satellite image.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "toppage_with_warnings.jpg",
    text: "By tapping on the alert list, you can see the details like potentially affected area.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "sidemenu_before.jpg",
    text: "Tapping on the left top corner will open the side menu.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "sidemenu_after.jpg",
    text: "The app can be closed by selecting 'Quit' here. Or you can use the Home button and the Back button of your smartphone.",
    platforms: ["android"]
  },
  {
    image: "home_screen.jpg",
    text: "An alert can be received while the app is not running. The alert will appear in the notification list.",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "home_screen.jpg",
    text: "If you hear this sound, a Tsunami watch or warning has been issued. Please check the information right away.",
    sound: "tsunami_warning.wav",
    platforms: ["browser", "android", "ios"]
  },
  {
    image: "background_reception.jpg",
    text: "Tapping the notification will open the app.",
    platforms: ["browser", "android", "ios"]
  }
];

class UsagePage extends React.Component {

  constructor(props){
    super(props);
    this.onChangeIndex = this.onChangeIndex.bind(this);
    this.platform = Meteor.isCordova ? device.platform.toLowerCase() : "browser";
    this.pages = pages.filter((page)=>{
      return page.platforms.indexOf(this.platform) >= 0;
    });
  }

  render(){
    const imageStyle = {
      "maxHeight": "70%",
      "minWidth": "0%",
      "width": "auto",
      "height": "auto",
      "margin": "0 auto"
    };

    const settings = {
      dots: false,
      infinite: false,
      arrow: false,
      speed: 500,
      slidesToShow: 1,
      slidesToScroll: 1,
      touchMove: true,
      touchThreshold: 10,
      autoplay: true,
      autoplaySpeed: 5000,
      afterChange: (currentSlide)=>{
        console.log("afterChange fired. currentSlide = "+currentSlide);
      }
    };


    return (
      <Slider {...settings}>
          {
            this.pages.map((page, index)=>{
              return (
                <div>
                  <Card style={{minHeight: "100%"}} key={index}>
                    <CardMedia style={{margin: "0 auto"}}>
                      <img
                        src={"/images/screenshots/"+page.image}
                        style={imageStyle}
                      />
                    </CardMedia>
                    <CardText style={{minHeight: "20%", maxHeight: "20%"}}>
                      {page.text}
                    </CardText>
                  </Card>
                </div>
              )
            })
          }
          <div>
            <Card>
              <CardText>{"Now you're ready to use this app!"}</CardText>
              <CardActions>
                <RaisedButton
                  label={'Finish'}
                  disableTouchRipple={true}
                  disableFocusRipple={true}
                  primary={true}
                  onTouchTap={()=>{history.back()}}
                  style={{marginRight: 12}}
                />
              </CardActions>
            </Card>
          </div>
        </Slider>
    )
  }

  onChangeIndex(index){
    if( this.pages[index].sound && Meteor.isCordova ){
      Meteor.defer(()=>{
        playSoundNoDelay(this.pages[index].sound);
      })
    }
  }
}

UsagePage.propTypes = {
  onPageSelection: React.PropTypes.func
}

export default translate(['common'])(UsagePage);
