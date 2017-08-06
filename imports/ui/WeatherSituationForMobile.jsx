import React from 'react';
import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import CardMedia from 'material-ui/Card/CardMedia';
import CardText from 'material-ui/Card/CardText';

import Config from '/imports/config.js';

import Event from '/imports/api/client/magnifier/Event.js';
import Magnifier from '/imports/api/client/magnifier/Magnifier.js';
import '/imports/api/client/magnifier/magnifier.css';

export class WeatherSituation extends React.Component {

  constructor(props){
    super(props);
    this.images = [
      {
        title: "Surface Stream Chart",
        url: Config.cacheFiles.surfaceChart
      },
      {
        title: "Satellite Image",
        url: Config.cacheFiles.satelliteImage
      }
    ];

  }

  dateTimeToString(dateTime){
    return moment(dateTime).format("YYYY-MM-DD HH:mm");
  }

  render(){
    const t = this.props.t;

    return (
      <div>
        <Card>
          <CardHeader
            title={t("Weather")+" "+t("situation")}
            subtitle={t("Issued_at")+" "+this.dateTimeToString(this.props.issuedAt)}
          />
          <CardText>
            {this.props.situation}
          </CardText>
        </Card>

        {
          this.images.map(({title, url}, key)=>{
            const imgId = "weather_situation_image_"+ key;
            return (
              <Card>
                <CardHeader
                  title={title}
                  showExpandableButton={true}
                />
                <CardMedia expandable={true}>
                  <img src={url} id={imgId} style={{width: "100%"}} onLoad={()=>{
                    const magnifier = new Magnifier(new Event());
//                    if( magnifier ){
                      magnifier.attach({
                        thumb: '#'+imgId,
                        large: url,
                        zoom: 3,
                        mode: "inside"
                      })
//                    }
                  }}/>
                </CardMedia>
              </Card>
            )
          })
        }
      </div>

      );
    }

  }

WeatherSituation.propTypes = {
  t: React.PropTypes.func,
  situation: React.PropTypes.string
}
