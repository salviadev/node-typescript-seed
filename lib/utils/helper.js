"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _cloneArray = (src) => {
    return src.map(item => {
        if (item) {
            if (Array.isArray(item))
                return _cloneArray(item);
            else if (typeof item === 'object')
                return _cloneObject(item);
            else
                return item;
        }
        else
            return item;
    });
}, _cloneObject1 = (src) => {
    if (src === null || src === undefined)
        return src;
    let res = {};
    Object.keys(src).forEach(propertyName => {
        let item = src[propertyName];
        if (item) {
            if (Array.isArray(item)) {
                res[propertyName] = _cloneArray(item);
            }
            else if (typeof item === 'object') {
                res[propertyName] = _cloneObject(item);
            }
            else
                res[propertyName] = item;
        }
        else
            res[propertyName] = item;
    });
    return res;
}, _cloneObject = (src) => {
    if (src === null || src === undefined)
        return src;
    return Object.assign({}, src);
}, _clone = (src) => {
    if (!src)
        return src;
    let tt = typeof src;
    if (tt === 'object') {
        if (Array.isArray(src))
            return _cloneArray(src);
        else
            return _cloneObject(src);
    }
    else
        return src;
}, _format = (...args) => {
    let s = args[0];
    return s.replace(/{(\d+)}/g, function (match, num) {
        let n = parseInt(num, 10);
        return args[n + 1];
    });
};
exports.clone = _clone;
exports.format = _format;
