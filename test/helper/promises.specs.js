"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
async function test() {
    let start = (new Date()).getTime();
    let v = await index_1.delay(200);
    let end = (new Date()).getTime();
    assert.equal(end - start > 100, true, ' 200 milliseconds passed');
}
describe('Promises', () => {
    before((done) => {
        done();
    });
    it('Test Delay', (done) => {
        test().then(function () {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
