/* The following imports are required by the result of eval function.
   Disable the eslint rule to check unused vars in this file.
*/
/* eslint no-unused-vars: 0 */
import AboutAppPage from '../../ui/AboutAppPage.jsx';
import PreferencesPageContainer from '../../ui/PreferencesPage.jsx';
import TopPage from "../../ui/TopPage.jsx";
import UsagePage from "../../ui/UsagePage.jsx";

// Icons
import HomeIcon from 'material-ui/svg-icons/action/home';
import SettingsIcon from 'material-ui/svg-icons/action/settings';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import WeatherIcon from 'material-ui/svg-icons/image/wb-sunny';
import CopyrightIcon from 'material-ui/svg-icons/action/copyright';
import InfoOutlineIcon from 'material-ui/svg-icons/action/info-outline';

export function getReactComponentByName(componentName){
  return eval(componentName);
}
