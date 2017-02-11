import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
/* i18n */
import { translate } from 'react-i18next';

import {TideTableCollection} from '../api/tidetable.js';

import './css/TideTable.css';

class DailyTideTable extends React.Component {

  shouldComponentUpdate(newProps, _newState){
    if( !newProps.tideTable || newProps.tideTable.length == 0 ){
      return false;
    }
    return true;
  }

  render(){
    let key = 0;
    const t = this.props.t;

    return (
      <table className="tidetable">
        <thead>
          <tr>
            <th className="tidetable">{t("Tide")}</th>
            <th className="tidetable">{t("Time")}</th>
            <th className="tidetable">{t("Height")}</th>
          </tr>
        </thead>
        <tbody>
          {
            this.props.tideTable.map((tide)=>{
              key++;
              return (
                <tr key={key}>
                  <td>{t(tide.tide)}</td>
                  <td>{tide.time}</td>
                  <td>{tide.height+"m"}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    )
  }
}

DailyTideTable.propTypes = {
  t: React.PropTypes.func,
  tideTable: React.PropTypes.array
}

const DailyTideTableContainer = createContainer(({date})=>{
  return {
    tideTable: TideTableCollection.find({
      dateTime: {
        "$gte": moment(date).startOf('day').utc().toDate(),
        "$lte": moment(date).endOf('day').utc().toDate()
      }
    },
    {
      transform: (tide)=>{
        // Use the dateTime instead of the original (entered) tide.time,
        // because tide.dateTime considers the Daylight Saving Time.
        const mDateTime = moment(tide.dateTime).local();
        tide.time = mDateTime.format("HH:mm");

        return tide;
      }
    }).fetch()
  }
}, DailyTideTable);

export default translate(['common'])(DailyTideTableContainer);
