App.info({
  id: 'ws.gov.samet.mhews',
  name: 'mhews',
  description: 'Multi-Hazard Early Warning System mobile app',
  author: 'Samoa Meteorology Division',
  website: 'http://www.samet.gov.ws'
});

App.icons({
  'android_mdpi': 'icons/Samet_mdpi.png',
  'android_hdpi': 'icons/Samet_hdpi.png',
});

App.launchScreens({
  'android_hdpi_portrait': 'icons/Samet_hdpi_portrait.png'
});

App.configurePlugin('cordova-plugin-googlemaps', {
  'API_KEY_FOR_ANDROID': 'AIzaSyBwHyTZ7cOOfBTSiVX314bLE1UbwqBVURA'
});
