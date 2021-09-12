"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testConstant_1 = require("./testConstant");
const Constants = require("./testConstant");
const a = "via constant";
it(a, () => {
    expect(a).toBe(1);
});
it(`substitution ${a}`, () => {
    expect(a).toBe(1);
});
const b = 5;
const c = a;
it(`another ${a}, ${b}, ${c}`, () => {
    expect(a).toBe(1);
});
it(testConstant_1.Test, () => {
    expect(a).toBe(1);
});
it(`imported ${testConstant_1.Test}`, () => {
    expect(a).toBe(1);
});
it(`Import star: ${Constants.Test}`, () => {
    expect(a).toBe(1);
});
it("exp" + "a" + 5, () => {
    expect(a).toBe(1);
});
it("exp multiline " +
    `abc ` +
    'def', () => {
    expect(a).toBe(1);
});
it(`exp ${testConstant_1.Test} ` +
    a, () => {
    expect(a).toBe(1);
});
//# sourceMappingURL=valid.js.map