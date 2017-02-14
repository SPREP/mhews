import React from 'react';
import {Card, CardHeader, CardActions, CardMedia, CardTitle} from 'material-ui/Card';
import Link from './Link.jsx';
import './css/ClimatePage.css';

export default class ClimatePage extends React.Component {

  render(){
    return (
      <Card>
        <CardMedia>
          <img src="http://docs.niwa.co.nz/eco/samoa/img/FWI_regional.png"/>
        </CardMedia>
        <CardActions>
          <Link href="http://www.samet.gov.ws/climate/drought_30.php">Drought Index Map (on Samoa Meteorology Web site)</Link>
        </CardActions>
      </Card>

    );
  }
}
