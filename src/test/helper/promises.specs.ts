import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { delay } from '../../index';



async function test(): Promise<void> {
    let start = (new Date()).getTime();
    let v = await delay(200);
    let end = (new Date()).getTime();
    assert.equal(end - start > 100 , true, ' 200 milliseconds passed');
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
        })

    });

});

