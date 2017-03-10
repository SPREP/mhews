import React from 'react';
import Link from './components/Link.jsx';
import Config from '../config.js';

import './css/App.css';

export default class AboutAppPage extends React.Component {

  renderIcon(type){
    return (<img src={Config.notificationConfig[type].icon} width="32px" height="32px"/>);
  }

  render(){
    return(
      <div className="app">
        <h3>Multi Hazard Early Warning System (MHEWS) version 1.1.1</h3>
        <p>
This smartphone application provides the weather forecast and
hazard warning information from Samoa Meteorology Division (SMD)
so that the users can take early actions to reduce the impact by potential disasters.
Please visit <Link href='http://www.samet.gov.ws/'>SMD's web site</Link> as
well as our <Link href='https://www.facebook.com/SamoaMeteorologicalServices/'>Facebook page</Link>,
where you can find more about the weather, climate, and geophysics in Samoa.
        </p>
        <h3>Bulletin types and levels</h3>
Samoa Meteorology Division issues the following hazard warning bulletins:
<table>
  <tr><td>{this.renderIcon("heavyRain")}</td><td>Heavy Rain Warning</td></tr>
  <tr><td>{this.renderIcon("earthquake")}</td><td>Earthquake Information</td></tr>
  <tr><td>{this.renderIcon("tsunami")}</td><td>Tsunami Advisory, Watch and Warning</td></tr>
  <tr><td>{this.renderIcon("cyclone")}</td><td>Cyclone Watch and Warning</td></tr>
</table>

"Warning" is severer than "Watch", and "Watch" is severer than "Advisory".

        <h3>Privacy Policy</h3>
Please visit our <Link href='http://www.samet.gov.ws/mhews/privacy_policy.html'>web site</Link> for the latest privacy policy.
        <p>
        </p>
        <h3>About Samoa Meteorology Division</h3>
        <p>
          Samoa Meteorology Division (SMD) has a long history over 110 years,
          from its foundation as a geophysical observatory "Apia Observatory" in 1902.
          Currently over 30 people are working day and night, to provide 24 hours / 7 days service to the people in Samoa.
        </p>
        <h3>Copyright</h3>
        (c) Samoa Meteorology Division, 2017
        <p>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
        <h3>3rd party software</h3>
        This software uses 3rd party software listed in <Link href="https://github.com/takeshi4126/mhews/blob/master/LICENSE-3RD-PARTY.txt">this document</Link>.
      </div>
    );
  }
}
