App.info({
  id: 'ws.gov.samet.mhews',
  version: "1.2.2",
  name: 'Samoa weather',
  description: 'Multi-Hazard Early Warning System mobile app',
  author: 'Samoa Meteorology Division',
  website: 'http://www.samet.gov.ws'
});

App.icons({
  'android_mdpi': 'icons/android/icon-48-mdpi.png',
  'android_hdpi': 'icons/android/icon-72-hdpi.png',
  'android_xhdpi': 'icons/android/icon-96-xhdpi.png',
  'android_xxhdpi': 'icons/android/icon-144-xxhdpi.png',
  'android_xxxhdpi': 'icons/android/icon-192-xxxhdpi.png',
  'iphone': 'icons/ios/icon-60.png',
  'iphone_2x': 'icons/ios/icon-60-2x.png',
  'iphone_3x': 'icons/ios/icon-60-3x.png',
  'ipad': 'icons/ios/icon-76.png',
  'ipad_2x': 'icons/ios/icon-76-2x.png'
});

App.launchScreens({
  'android_mdpi_portrait': 'screens/android/screen-mdpi-portrait.png',
  'android_hdpi_portrait': 'screens/android/screen-hdpi-portrait.png',
  'android_xhdpi_portrait': 'screens/android/screen-xhdpi-portrait.png',
  'android_xxhdpi_portrait': 'screens/android/screen-xxhdpi-portrait.png',
  'android_xxxhdpi_portrait': 'screens/android/screen-xxxhdpi-portrait.png',
  'iphone_2x': 'screens/ios/screen-iphone-portrait-2x.png',
  'iphone5': 'screens/ios/screen-iphone-portrait-568h-2x.png',
  'iphone6': 'screens/ios/screen-iphone-portrait-667h.png',
  'iphone6p_portrait': 'screens/ios/screen-iphone-portrait-736h.png',
  'ipad_portrait': 'screens/ios/screen-ipad-portrait.png',
  'ipad_portrait_2x': 'screens/ios/screen-ipad-portrait-2x.png'
});

App.configurePlugin('cordova-plugin-googlemaps', {
  'API_KEY_FOR_ANDROID': 'AIzaSyAU8GJceF2q71UkbwDkFbl7Hzx9Y6mcFAU'
});

App.setPreference("LoadUrlTimeoutValue", 1000000);
App.setPreference("SplashMaintainAspectRatio", "true");
App.setPreference("ShowSplashScreenSpinner", "true");
App.setPreference("WebAppStartupTimeout",1000000);

App.setPreference("AutoHideSplashScreen", false);

//App.accessRule('<access origin="*" />');
App.accessRule('*');
