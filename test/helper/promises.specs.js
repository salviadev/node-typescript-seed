"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../../index");
async function test() {
    let start = (new Date()).getTime();
    let v = await index_1.delay(20);
    let end = (new Date()).getTime();
    assert.equal(end - start >= 20, true, ' 20 milliseconds passed (1)');
    start = (new Date()).getTime();
    for (let i = 0; i < 10; i++) {
        await index_1.delay(2);
    }
    end = (new Date()).getTime();
    assert.equal(end - start >= 20, true, ' 20 milliseconds passed (2)');
    start = (new Date()).getTime();
    let p = [];
    for (let i = 0; i < 10; i++) {
        p.push(index_1.delay(2));
    }
    await Promise.all(p);
    end = (new Date()).getTime();
    assert.equal(end - start < 5, true, ' 2 milliseconds passed (2)');
}
describe('Promises', () => {
    before((done) => {
        done();
    });
    it('Test Delay', (done) => {
        test().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });
    });
});
