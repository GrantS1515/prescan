import * as E from "fp-ts/lib/Either.js";
import { pipe } from 'fp-ts/lib/function.js';
import { produce } from "immer";
import * as EqTo from "eq-to/dist/index.js";
import * as Sm from "splitmachine/dist/index.js";
import * as Sp from "SplitString/dist/index.js";
export const errEq = e => pipe(e, EqTo.checkField("name")(EqTo.basicEq), E.chain(EqTo.checkField("msg")(EqTo.basicEq)));
const stopFn = Sm.newStopFn("stop");
const letFnFn = {
    name: "ShiftFnArgs",
    strLen: 1,
    testFn: (s => pipe(s.match(/^[a-z0-9]+$/i), str => str !== null)),
};
const quoteFnFn = {
    name: "ShiftFnArgs",
    strLen: 1,
    testFn: (s => pipe(s === "\"")),
};
const extNewLineFnFn = {
    name: "ShiftFnArgs",
    strLen: 1,
    testFn: (s => pipe(s === "\n")),
};
const extLetFn = Sm.newStateShiftFn("extLet")(letFnFn);
const intLetFn = Sm.newStateShiftFn("intLet")(letFnFn);
const startQuoteFn = Sm.newStateShiftFn("startQuote")(quoteFnFn);
const endQuoteFn = Sm.newStateShiftFn("endQuote")(quoteFnFn);
const extNewLineFn = Sm.newStateShiftFn("extNewLine")(extNewLineFnFn);
const intNewLineFnArgs = {
    name: "GenFnArgs",
    strLen: 1,
    testFn: (s) => s === "\n",
    splitFn: (sps) => pipe(sps, Sp.insertLeft("\""), Sp.shiftLeft(1), E.map(Sp.insertLeft("\"")))
};
const intNewLineFn = Sm.newStateGenFn("intNewLine")(intNewLineFnArgs);
const sepNewLinesMachine = {
    name: "Machine",
    stopId: "stop",
    transitions: new Map([
        ["start", [extLetFn, startQuoteFn, stopFn]],
        ["extLet", [extLetFn, startQuoteFn, extNewLineFn, stopFn]],
        ["startQuote", [intLetFn, endQuoteFn]],
        ["intLet", [intLetFn, endQuoteFn, intNewLineFn]],
        ["endQuote", [extLetFn, stopFn]],
        ["extNewLine", [extNewLineFn, extLetFn, startQuoteFn, stopFn]],
        ["intNewLine", [endQuoteFn, intLetFn, stopFn]],
    ]),
};
const defaultState = {
    name: "State",
    id: "",
    split: Sp.newSplitString("")("")
};
const newStartState = s => produce(defaultState, draft => {
    draft.id = "start",
        draft.split = Sp.newSplitString("")(s);
});
export const sepNewLines = s => pipe(s, newStartState, Sm.interp(sepNewLinesMachine), E.map(Sp.getLeft));
