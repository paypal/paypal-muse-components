/* eslint import/no-commonjs: 0 */
const zoidGlobals = require('@krakenjs/zoid/globals');
const postRobotGlobals = require('@krakenjs/post-robot/globals');

module.exports = {
  __ZOID__: {
    ...zoidGlobals.__ZOID__,
    __FRAMEWORK_SUPPORT__: true,
    __SCRIPT_NAMESPACE__:  true
  },
  __POST_ROBOT__: {
    ...postRobotGlobals.__POST_ROBOT__,
    __IE_POPUP_SUPPORT__: false,
    __SCRIPT_NAMESPACE__: true
  },
}
