import * as assert from 'assert';
import * as mochaUtils from 'mocha';
import { clone } from '../../index';


describe('Helper', () => {
    const co = {
        a: 2,
        b: [1, 2, 3, { a: 8 }],
        c: { a: 2 }
    }
    it('Clone complex object', () => {
        let nt = clone(co);
        assert.deepEqual(nt, co, 'clone (2)');
    });

    it('Clone null', () => {
        let nt = clone(null);
        assert.deepEqual(nt, null, 'clone (3)');
    });

    it('Clone simple object', () => {
        let so: any = { a: 5, b: [null] }
        so.c = null;
        let nt = clone(so);
        assert.deepEqual(so, so, 'clone (4)');
    });

    it('Clone number', () => {
        assert.equal(clone(10), 10, 'clone (5)');
    });

    it('Clone string', () => {
        assert.equal(clone('I love heavy metal'), 'I love heavy metal', 'clone (6)');
    });

    it('Clone undefined', () => {
        let nt = clone(null);
        assert.equal(clone(undefined), undefined, 'clone (7)');
    });
    // it('Clone recursive', () => {
    //    let nt = clone(co);
    //    assert.notEqual(nt.c, co.c, 'clone (8)');
    // });

});
