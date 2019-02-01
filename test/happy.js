/* @flow */

import '../src/index'; // eslint-disable-line import/no-unassigned-import

describe('muse', () => {
    it('should insert pptm.js with client ID and merchant ID', () => {
        const script = document.getElementById('xo-pptm');
        const expectedUrl = `id=${ window.location.hostname }&t=xo&mrid=xyz&client_id=abc`;
        let src = '';

        if (script) {
            // $FlowFixMe
            src = script.src;
        }

        if (!src.match(expectedUrl)) {
            throw new Error(`Expected script.src to match ${ expectedUrl }, got ${ src }`);
        }
    });
});
