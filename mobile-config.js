App.info({
  id: 'ws.gov.samet.mhews',
  version: "1.1.1",
  name: 'Samoa weather',
  description: 'Multi-Hazard Early Warning System mobile app',
  author: 'Samoa Meteorology Division',
  website: 'http://www.samet.gov.ws'
});

App.icons({
  'android_mdpi': 'icons/Samet_mdpi.png',
  'android_hdpi': 'icons/Samet_hdpi.png',
  'android_xhdpi': 'icons/Samet_xhdpi.png',
  'android_xxhdpi': 'icons/Samet_xxhdpi.png',
  'android_xxxhdpi': 'icons/Samet_xxhdpi.png',
  'iphone': 'icons/Samet_60x60.png',
  'iphone_2x': 'icons/Samet_120x120.png',
  'iphone_3x': 'icons/Samet_180x180.png',
});

App.launchScreens({
  'android_mdpi_portrait': 'icons/Samet_mdpi_portrait.png',
  'android_hdpi_portrait': 'icons/Samet_hdpi_portrait.png',
  'android_xhdpi_portrait': 'icons/Samet_hdpi_portrait.png',
  'android_xxhdpi_portrait': 'icons/Samet_hdpi_portrait.png',
  'android_xxxhdpi_portrait': 'icons/Samet_hdpi_portrait.png',
  'iphone': 'icons/Samet_hdpi_portrait.png',
  'iphone_2x': 'icons/Samet_hdpi_portrait.png',
  'iphone_3x': 'icons/Samet_hdpi_portrait.png'
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
