import * as E from "fp-ts/lib/Either.js";
import { pipe } from 'fp-ts/lib/function.js';
import { produce } from "immer";
import * as EqTo from "eq-to/dist/index.js";
import * as Sm from "splitmachine/dist/index.js";
import * as Sp from "SplitString/dist/index.js";
export const errEq = e => pipe(e, EqTo.checkField("name")(EqTo.basicEq), E.chain(EqTo.checkField("msg")(EqTo.basicEq)));
const stopFn = Sm.newStopFn("stop");
const extLetFn = Sm.newStateShiftFn(1)(s => pipe(s.match(/^[a-z0-9]+$/i), str => str !== null))("Not a letter")("extLet");
const sepNewLinesMachine = {
    name: "Machine",
    stopId: "stop",
    transitions: new Map([
        ["start", [extLetFn, stopFn]],
        ["extLet", [extLetFn, stopFn]],
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
export const sepNewLines = s => pipe(s, newStartState, Sm.interp(sepNewLinesMachine), E.map(sps => sps.sep.left) // TODO clean and add an empty check
);
