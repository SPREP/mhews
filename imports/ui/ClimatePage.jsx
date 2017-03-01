import React from 'react';
import Link from './Link.jsx';
import { createContainer } from 'meteor/react-meteor-data';
/* i18n */
import { translate } from 'react-i18next';
import {Preferences} from '../api/client/preferences.js';
import {toTitleCase} from '../api/strutils.js';

import './css/ClimatePage.css';

const cardTitleStyle = { fontSize: "12pt"};
const imageStyle = { maxWidth: "100%" };
const innerDivStyle = { paddingTop: "12px", paddingBottom: "12px"};

const representativeStations = {
  "upolu-north-northwest": 76200, // Apia
  "upolu-east-southwest": 76205, // Togitogiga
  "savaii-east-northeast": 76026, // Maota
  "savaii-northwest": 76000, // Asau
  "savaii-south": 76200 // Apia (To be changed to Salailua, waiting for the update of Clidesk)
}

class FireIndexDescriptionTable extends React.Component {

  render(){
    const t = (key)=>{ return toTitleCase(this.props.t(key)) };

    return (
      <table className="fireindex_table">
        <th>{t("color")}</th>
        <th>{t("danger_class")}</th>
        <th>{t("action")}</th>
        <tr>
          <td style={{color: "green"}}>{t("colors.green")}</td>
          <td>{t("risks.low")}</td>
          <td>{t("level.normal")}</td>
        </tr>
        <tr>
          <td style={{color: "yellow"}}>{t("colors.yellow")}</td>
          <td>{t("risks.medium")}</td>
          <td>{t("level.watch")}</td>
        </tr>
        <tr>
          <td style={{color: "orange"}}>{t("colors.orange")}</td>
          <td>{t("risks.high")}</td>
          <td rowSpan="2">{t("climate_description.cease_fire_action")}</td>
        </tr>
        <tr>
          <td style={{color: "red"}}>{t("colors.red")}</td>
          <td>{t("risks.extreme")}</td>
        </tr>
      </table>
    )
  }
}

FireIndexDescriptionTable.propTypes = {
  t: React.PropTypes.func
}

class ClimatePage extends React.Component {

  render(){
    const t = this.props.t;
    const station = representativeStations[this.props.district];

    return (
      <div className="climate_page">
        <div>
          <div style={cardTitleStyle}>
            Climate Early Warning System
          </div>
          <div style={innerDivStyle}>
          Click <Link href="http://www.samet.gov.ws/climate/drought.html">here</Link> to access all the products from the Climate Early Warning System.
          </div>
          <div style={innerDivStyle}>
            <img src={"http://www.samet.gov.ws/climate/drought/DroughtMonitor90_"+ station + ".png"} style={imageStyle}/>
            <div>
              {t("climate_description.drought.rainfall")}
            </div>
          </div>
          <div style={innerDivStyle}>
            <img src="http://www.samet.gov.ws/climate/drought/smartphone/WS_drought_map_90_compact.png" style={imageStyle}/>
            <div>
              {t("climate_description.drought.map")}
            </div>
          </div>
          <div style={innerDivStyle}>
            <img src="http://docs.niwa.co.nz/eco/samoa/img/FWI_regional.png" style={imageStyle}/>
            <FireIndexDescriptionTable t={t} />
          </div>
        </div>
        <hr />
        <div>
          The Climate Early Warning System of Samoa Meteorology Division is powered by the CliDEsc system provided by NIWA (National Institute of Water and Atmospheric Research) in New Zealand.
        </div>

      </div>
    );
  }
}

ClimatePage.propTypes = {
  t: React.PropTypes.func,
  district: React.PropTypes.string
};

const ClimatePageContainer = createContainer(()=>{
  return {
    district: Preferences.load("district")
  }

}, ClimatePage);

export default translate(["common"])(ClimatePageContainer);
