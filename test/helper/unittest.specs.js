"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
async function test() {
    let v = await Promise.resolve(1);
    assert.equal(v, 1, 'Always true');
}
describe('Unit test skeleton', () => {
    it('Test 1', () => {
        return test();
    });
});
