import * as E from "fp-ts/lib/Either.js";
import * as B from "fp-ts/lib/boolean.js";
import { pipe } from 'fp-ts/lib/function.js';
import { produce } from "immer";
import * as EqTo from "eq-to/dist/index.js";
import * as Sm from "SplitMachine/dist/index.js";
import * as Sp from "SplitString/dist/index.js";
export const errEq = e => pipe(e, EqTo.checkField("name")(EqTo.basicEq), E.chain(EqTo.checkField("msg")(EqTo.basicEq)));
const stopFn = sps => pipe(sps, Sp.isRightEmpty, E.map(sp => ({ name: "State", id: "stop", split: sp })));
const alphanum = sps => pipe(sps, Sp.leadRight(1), E.map((s) => s.match(/^[a-z0-9]+$/i)), E.map(s => s !== null), E.chain(b => B.match(() => E.left(Sm.newErr("Not Letter")), () => Sp.shiftLeft(1)(sps))(b)), E.map(sp => ({ name: "State", id: "alphanum", split: sp })));
const alphanum = sps => pipe(sps, Sp.leadRight(1), E.map((s) => s.match(/^[a-z0-9]+$/i)), E.map(s => s !== null), E.chain(b => B.match(() => E.left(Sm.newErr("Not Letter")), () => Sp.shiftLeft(1)(sps))(b)), E.map(sp => ({ name: "State", id: "alphanum", split: sp })));
const sepNewLinesMachine = {
    name: "Machine",
    stopId: "stop",
    transitions: new Map([
        ["start", [alphanum, stopFn]],
        ["alphanum", [alphanum, stopFn]],
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
