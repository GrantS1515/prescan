import { pipe } from 'fp-ts/lib/function.js';
import * as Ps from "./index.js";
import { expect } from "chai";
import * as E from "fp-ts/lib/Either.js";
import * as EqTo from "eq-to/dist/index.js";
const in1 = "abc";
const out1 = "abc";
const in2 = "\"abc\"";
const out2 = "\"abc\"";
const in3 = "abc\"def\"ghi";
const out3 = "abc\"def\"ghi";
// TODO: empty, start with quote, start with newline
// TODO: make the letter fn have a regex input
// const in1 = "\"Hello\nWorld\""
// const out1 = "\"Hello\"\n\"World\""
describe("state manipulation tests", () => {
    it("Non-Quote Letters", () => {
        pipe(in1, Ps.sepNewLines, (s) => [s, E.right(out1)], EqTo.checkEither(Ps.errEq, EqTo.basicEq), EqTo.toBool, b => expect(b).to.equal(true));
    });
    it("Letters within quote", () => {
        pipe(in2, Ps.sepNewLines, (s) => [s, E.right(out2)], EqTo.checkEither(Ps.errEq, EqTo.basicEq), EqTo.toBool, b => expect(b).to.equal(true));
    });
    it("letters before and after quote", () => {
        pipe(in3, Ps.sepNewLines, (s) => [s, E.right(out3)], EqTo.checkEither(Ps.errEq, EqTo.basicEq), EqTo.toBool, b => expect(b).to.equal(true));
    });
});
