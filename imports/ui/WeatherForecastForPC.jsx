import React from 'react';

import Card from 'material-ui/Card/Card';
import CardHeader from 'material-ui/Card/CardHeader';
import {Nowcast} from './components/Nowcast.jsx';
import {WeatherSituation} from './WeatherSituationForMobile.jsx';

const cardStyle = {display: "inline-block", width: 300, verticalAlign: "top"};

/*
  Similar to the WeatherPage, but the forecast for all the days in the extended forecast period
  for a designated district is shown in a single page. Suitable for a PC browser.
  */
export class WeatherForecastForPC extends React.Component {

  render(){
    const t = this.props.t;

    return (
      <Card>
        {
          this.props.forecasts.map((forecast, index) => {
            return (
//              <Card key={index} style={cardStyle}>
<div style={cardStyle}>
                <Nowcast
                  forecast={forecast}
                  t={this.props.t}
                />
              </div>
//              </Card>
            )
          })
        }
        <CardHeader
          title={t("Weather")+" "+t("situation")}
          showExpandableButton={false}
          subtitle={t("Issued_at")+" "+this.dateTimeToString(this.props.issuedAt)}
        />
        <WeatherSituation t={t} expandable={false} situation={this.props.situation} />

</Card>
    );
  }


    dateTimeToString(dateTime){
      return moment(dateTime).format("YYYY-MM-DD HH:mm");
    }
}

WeatherForecastForPC.propTypes = {
  t: React.PropTypes.func,
  dates: React.PropTypes.array,
  issuedAt: React.PropTypes.object,
  situation: React.PropTypes.string,
  forecasts: React.PropTypes.array
}
