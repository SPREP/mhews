App.info({
  id: 'ws.gov.samet.mhews',
  version: "1.1.0",
  name: 'Samoa weather',
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
  'API_KEY_FOR_ANDROID': 'AIzaSyAU8GJceF2q71UkbwDkFbl7Hzx9Y6mcFAU'
});

App.setPreference("LoadUrlTimeoutValue", 1000000);
App.setPreference("SplashMaintainAspectRatio", "true");
App.setPreference("ShowSplashScreenSpinner", "true");
App.setPreference("WebAppStartupTimeout",1000000);

//App.accessRule('<access origin="*" />');
App.accessRule('*');
