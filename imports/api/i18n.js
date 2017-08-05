import i18next from 'i18next';
import {toTitleCase} from '../api/strutils.js';

const i18nextConfig = {
  lng: 'en',
  fallbackLng: 'en',
  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  debug: true,

  interpolation: {
    escapeValue: false // not needed for react!!
  }
};

class i18n {

  init(){
    if( this.initialized ) return;

    console.log("============== Initializing i18n");
    i18next.init(i18nextConfig);
    tweakTFunc(i18next);

    this.initialized = true;
  }

  getInstance(){
    return i18next;
  }

  changeLanguage(lang){
//    this.loadLanguage(lang);
    i18next.changeLanguage(lang);
  }

  loadLanguage(lang){
    const ns = "common";
    if( !i18next.hasResourceBundle(lang, ns)){
      const moduleName = "/locales/"+ lang + "." + ns + ".js";
      console.log("Adding resource bundle "+moduleName);

      const resource = require(moduleName).default;
      i18next.addResourceBundle(lang, ns, resource);
    }
  }

}

function tweakTFunc(i18n){
  i18n.t = (function(){
    const context = i18n;
    const originalT = i18n.t;

    return function(key, options){
      if( !key ){
        return key;
      }
      const lowerCaseKey = key.toLowerCase();
      const result = originalT.call(context, lowerCaseKey, options);

      // If the original key started with a capital letter, capitalize the result.
      return (key.charAt(0) == key.charAt(0).toUpperCase()) ? toTitleCase(result) : result;

    }
  })();

  return i18n;
}



const i18nInstance = new i18n();
export default i18nInstance;
