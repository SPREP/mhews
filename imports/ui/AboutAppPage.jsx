import React from 'react';

/* global cordova */

export default class AboutAppPage extends React.Component {

  render(){
    return(
      <div>
        <h3>Multi Hazard Early Warning System (MHEWS) version 0.1.3</h3>
        <p>
This smartphone application provides the weather forecast and
hazard warning information from Samoa Meteorology Division (SMD)
so that the users can take early actions to reduce the impact by potential disasters.
Please visit <a href="#" onClick={()=>{cordova.InAppBrowser.open('http://www.samet.gov.ws/', '_system')}}>SMD's web site</a> as
well as our <a href="#" onClick={()=>{cordova.InAppBrowser.open('https://www.facebook.com/SamoaMeteorologicalServices/', '_system')}}>Facebook page</a>,
where you can find more about the weather, climate, and geophysics in Samoa.
        </p>
        <h3>Privacy Policy</h3>
        <p>
This application does not collect any information that can identify the user of the application.
(e.g. phone number, device identify, e-mail address).
This Privacy Policy will be updated accordingly if the future update of the application requires collection of user's information
for providing a better service.
        </p>
        <h3>About Samoa Meteorology Division</h3>
        <p>
          Samoa Meteorology Division (SMD) has a long history over 110 years,
          from its foundation as a geophysical observatory "Apia Observatory" in 1902.
          Currently over 30 people are working day and night, to provide 24 hours / 7 days service to the people in Samoa.
        </p>
        <h3>Copyright</h3>
        (c) Samoa Meteorology Division, 2016 - 2017
        <p>
          THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
        </p>
      </div>
    );
  }
}
