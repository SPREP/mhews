import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { autoPlay } from 'react-swipeable-views-utils';
import RaisedButton from 'material-ui/RaisedButton';
import {Card, CardMedia, CardActions, CardText} from 'material-ui/Card';

import {playSoundNoDelay} from '../api/client/mediautils.js';

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const topPageName = Meteor.settings.public.topPage;

// Shows the usage when the user starts the app for the first time.
// 1) Alarm list
// 2) Weather forecast. Horizontally scrollable.
// 3) Menu at the left top corner.
// 4) Receive notification in the background

const pages = [
  {
    image: "toppage.jpg",
    text: "The app shows the weather forecast and alert list. If there's no alert in effect, a smile icon is displayed."
  },
  {
    image: "weather_details.jpg",
    text: "The details of the weather forecast are displayed by tapping on the rectangle."
  },
  {
    image: "weather_surface_chart.jpg",
    text: "By swiping on the image, you can see either the surface chart..."
  },
  {
    image: "weather_satellite.jpg",
    text: "Or the satellite image."
  },
  {
    image: "toppage_with_warnings.jpg",
    text: "By tapping on the alert list, you can see the details like potentially affected area."
  },
  {
    image: "sidemenu_before.jpg",
    text: "Tapping on the left top corner will open the side menu."
  },
  {
    image: "sidemenu_after.jpg",
    text: "The app can be closed by selecting 'Quit' here. Or you can use the Home button and the Back button of your smartphone."
  },
  {
    image: "home_screen.jpg",
    text: "An alert can be received while the app is not running. The alert will appear in the notification list."
  },
  {
    image: "home_screen.jpg",
    text: "If you hear this sound, a Tsunami watch or warning has been issued. Please check the information right away.",
    sound: "tsunami_warning.wav"
  },
  {
    image: "background_reception.jpg",
    text: "Tapping the notification will open the app."
  }
];

class UsagePage extends React.Component {

  constructor(props){
    super(props);
    this.state = {index: 0, finished: false};
    this.onChangeIndex = this.onChangeIndex.bind(this);
  }

  render(){
    const imageStyle = {
      "max-height": "70%",
      "min-width": "0%",
      "width": "auto",
      "height": "auto",
      "margin": "0 auto"
    };

    return (
      <AutoPlaySwipeableViews
        interval={5000}
        index={this.state.index}
        onChangeIndex={this.onChangeIndex}
        >
          {
            pages.map((page)=>{
              return (
                <Card style={{minHeight: "100%"}}>
                  <CardMedia style={{margin: "0 auto"}}>
                    <img
                      src={"images/screenshots/"+page.image}
                      style={imageStyle}
                    />
                  </CardMedia>
                  <CardText style={{minHeight: "20%", maxHeight: "20%"}}>
                    {page.text}
                  </CardText>
                </Card>
              )
            })
          }
          <Card>
            <CardText>{"Now you're ready to use this app!"}</CardText>
            <CardActions>
              <RaisedButton
                label={'Finish'}
                disableTouchRipple={true}
                disableFocusRipple={true}
                primary={true}
                onTouchTap={()=>{this.props.onPageSelection(topPageName)}}
                style={{marginRight: 12}}
              />
            </CardActions>
          </Card>
        </AutoPlaySwipeableViews>
    )
  }

  onChangeIndex(index, indexLatest){
    if( indexLatest < index ){
      if( !this.state.finished ){
        this.setState({index: index})
      }
    }
    else{
      this.setState({finished: true})
    }
    if( pages[index].sound && Meteor.isCordova ){
      Meteor.defer(()=>{
        playSoundNoDelay(pages[index].sound);
      })
    }
  }
}

UsagePage.propTypes = {
  onPageSelection: React.PropTypes.func
}

export default UsagePage;
