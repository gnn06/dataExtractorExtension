var assert = require('assert');
const t = require("../js/app/service/text.js");

describe('Array', function () {
    describe('#indexOf()', function () {
        it('should return -1 when the value is not present', function () {
            assert.equal(t.matchAny(["aze", "wxc"], ["az"]), "aze");
            assert.equal(t.matchAny(["aze", "wxc"], ["wx"]), "wxc");
            assert.equal(t.matchAny(["aze", "wxc"], ["aze"]), "aze");
            assert.equal(t.matchAny(["aze", "wxc"], ["wxc"]), "wxc");
            assert.equal(t.matchAny(["aze", "wxc"], ["zz"]), undefined);
            assert.equal(t.matchAny(["aze", "wxc"], ["rr", "az"]), "aze");
        });
        it('should manage case insensitive', function () {
            assert.deepEqual(t.splitWords("aze qsd"), ["aze", "qsd"]);
            assert.deepEqual(t.splitWords("AZE QSD"), ["aze", "qsd"]);
        });
        it('closedTo', function () {
            assert.equal(t.closedTo("aa bb cc dd ee ff gg hh ii jj kk ll mm nn oo pp qq", 10, ["hh"]), "hh");
        });
    });
});