import i18next from 'i18next';
import Config from '/imports/config.js';

const i18nextConfig = {
  lng: 'en',
  fallbackLng: 'en',
  // have a common namespace used around the full app
  ns: ['common'],
  defaultNS: 'common',

  debug: false,

  interpolation: {
    escapeValue: false // not needed for react!!
  }
};

class i18n {

  init(){
    // Config.languages.forEach((lang)=>{
    //   const ns = "common";
    //   const moduleName = "/locales/"+ lang + "." + ns + ".js";
    //   const resources = i18nextConfig.resources ? i18nextConfig.resources : {};
    //   resources[lang] = {};
    //   resources[lang][ns] = require(moduleName).default;
    //   _.extend(i18nextConfig, {resources: resources});
    // });
    //
    i18next.init(i18nextConfig);
  }

  changeLanguage(lang){
    const ns = "common";

    if( !i18next.hasResourceBundle(lang, ns)){
      const moduleName = "/locales/"+ lang + "." + ns + ".js";
      const resource = require(moduleName).default;
      i18next.addResourceBundle(lang, ns, resource);
    }
    i18next.changeLanguage(lang);
  }

}

const i18nInstance = new i18n();
export default i18nInstance;
