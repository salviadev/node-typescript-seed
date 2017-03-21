import * as assert from 'assert';
import * as mochaUtils from 'mocha';

async function test(): Promise<void> {
    let v = await Promise.resolve(1);
    assert.equal(v, 1, 'Always true');
}


describe('Unit test skeleton', () => {
    before((done) => {
        done();
    });
    it('Test 1', (done) => {
        test().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        })

    });

});

