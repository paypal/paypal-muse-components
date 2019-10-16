/* @flow */
import { logger } from './logger';

const _roundOffPerfTimer = num => {
  let roundOffNumber = -1;
  if (typeof num !== 'undefined') {
    if (num === parseInt(num, 10)) {
      roundOffNumber = num;
    } else if (num > 0 && num < 1) {
      roundOffNumber = parseFloat(num.toFixed(1));
    } else {
      roundOffNumber = parseFloat(num.toFixed(0));
    }
  }
  return roundOffNumber;
};

const getBrowserHeight = () => window.innerHeight;

const getBrowserWidth = () => window.innerWidth;

const getScreenHeight = () => {
  try {
    return window.screen.height;
  } catch (err) {
    return null;
  }
};

const getScreenWidth = () => {
  try {
    return window.screen.width;
  } catch (err) {
    return null;
  }
};

const getDeviceHeight = () => {
  const screen = window.screen || {};
  const ratio = window.devicePixelRatio || 1;

  let w = _roundOffPerfTimer(screen.width * ratio);
  let h = _roundOffPerfTimer(screen.height * ratio);

  if (Math.abs(window.orientation) === 90) {
    const temp = w;
    w = h;
    h = temp;
  }

  return h;
};

const getDeviceWidth = () => {
  const screen = window.screen || {};
  const ratio = window.devicePixelRatio || 1;

  let w = _roundOffPerfTimer(screen.width * ratio);
  let h = _roundOffPerfTimer(screen.height * ratio);

  if (Math.abs(window.orientation) === 90) {
    const temp = w;
    w = h;
    h = temp;
  }
  return w;
};

const getRosettaLanguage = () => {
  if (window.navigator.languages) {
    return window.navigator.languages.join(',');
  }
  if (window.navigator.userLanguage) {
    return window.navigator.userLanguage;
  }
  if (window.navigator.language) {
    return window.navigator.language;
  }
  if (window.navigator.browserLanguage) {
    return window.navigator.browserLanguage;
  }
  if (window.navigator.systemLanguage) {
    return window.navigator.systemLanguage;
  }
};

const getLocation = () => {
  return `${ window.location.origin }${ window.location.pathname }`;
};

export const getPageTitle = () => document.title;

export const getBrowserPlugins = () => {
  const getPluginData = () => {
    return {
      director: 'application/x-director',
      mediaplayer: 'application/x-mplayer2',
      pdf: 'application/pdf',
      quicktime: 'video/quicktime',
      real: 'audio/x-pn-realaudio-plugin',
      silverlight: 'application/x-silverlight'
    };
  };

  const getFlashVersion = () => {
    let version = null;
    if (window.navigator.plugins && window.navigator.plugins.length > 0) {
      const type = 'application/x-shockwave-flash';
      const mimeTypes = window.navigator.mimeTypes;
      if (
        mimeTypes &&
        mimeTypes[type] &&
        mimeTypes[type].enabledPlugin &&
        mimeTypes[type].enabledPlugin.description
      ) {
        version = mimeTypes[type].enabledPlugin.description;
      }
    }
    return version;
  };

  const detectPlugin = type => {
    const mimeTypes = window.navigator.mimeTypes;
    if (mimeTypes && mimeTypes.length) {
      const plugin = mimeTypes[type];
      return plugin && plugin.enabledPlugin;
    }
  };

  try {
    const pluginArray = [];
    const plugins = getPluginData();
    for (const name in plugins) {
      if (detectPlugin(plugins[name])) {
        pluginArray.push(name);
      }
    }
    const flash = getFlashVersion();
    if (flash) {
      pluginArray.push(flash);
    }
    return pluginArray.join(',');
  } catch (err) {
    logger.error('getPlugins', err);
    return null;
  }
};

export const getWindowLocation = () => window.location.href;

export const getDeviceInfo = () => {
  try {
    const browserWidth = getBrowserWidth();
    const browserHeight = getBrowserHeight();
    let deviceType;
    if (navigator.userAgent.match(/mobile/i)) {
      deviceType = 'Mobile';
    } else if (navigator.userAgent.match(/iPad|Android|Touch/i)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }
    return {
      deviceWidth: getDeviceWidth(),
      deviceHeight: getDeviceHeight(),
      screenWidth: getScreenWidth(),
      screenHeight: getScreenHeight(),
      colorDepth: screen && screen.colorDepth,
      rosettaLanguage: getRosettaLanguage(),
      location: getLocation(),
      deviceType,
      browserHeight,
      browserWidth
    };
  } catch (err) {
    logger.error('getDeviceInfo', err);
    return {};
  }
};

