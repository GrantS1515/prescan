import * as E from "fp-ts/lib/Either.js" 
import * as B from "fp-ts/lib/boolean.js"
import { pipe } from 'fp-ts/lib/function.js' 
import * as A from "fp-ts/lib/Array.js"
import * as Eq from "fp-ts/lib/Eq.js"
import * as St from "fp-ts/lib/Set.js"
import * as Op from "fp-ts/lib/Option.js"
import * as M from "fp-ts/lib/Monoid.js"
import * as SE from "fp-ts/lib/Separated.js"
import * as P from "fp-ts/lib/Predicate.js"
import { produce } from "immer"
import * as EqTo from "eq-to/dist/index.js"
import * as Sm from "splitmachine/dist/index.js"
import * as Sp from "SplitString/dist/index.js"

export type Err = {
	name: "Err",
	msg: string,
}

export const errEq:
	(e: [Err, Err]) =>
	E.Either<EqTo.Err, [Err, Err]> =
	e =>
	pipe(
		e,
		EqTo.checkField("name")(EqTo.basicEq),
		E.chain(EqTo.checkField("msg")(EqTo.basicEq)),
	)

const stopFn: Sm.StateFn = 
    Sm.newStopFn("stop")

const letFnFn: Sm.ShiftFnArgs = {
    name: "ShiftFnArgs",
    strLen: 1,
	testFn: (s => pipe( 
            s.match(/^[a-z0-9]+$/i),
            str => str !== null,
        )),
}

const quoteFnFn: Sm.ShiftFnArgs = {
    name: "ShiftFnArgs",
    strLen: 1,
	testFn: (s => pipe( 
             s === "\""
        )),
}

const extNewLineFnFn: Sm.ShiftFnArgs = {
    name: "ShiftFnArgs",
    strLen: 1,
	testFn: (s => pipe( 
             s === "\n"
        )),
}

const extLetFn: Sm.StateFn =
    Sm.newStateShiftFn("extLet")(letFnFn)

const intLetFn: Sm.StateFn =
    Sm.newStateShiftFn("intLet")(letFnFn)

const startQuoteFn: Sm.StateFn =
    Sm.newStateShiftFn("startQuote")(quoteFnFn)

const endQuoteFn: Sm.StateFn =
    Sm.newStateShiftFn("endQuote")(quoteFnFn)

const extNewLineFn: Sm.StateFn =
    Sm.newStateShiftFn("extNewLine")(extNewLineFnFn)

const intNewLineFnArgs: Sm.GenFnArgs = {
    name: "GenFnArgs",
    strLen: 1,
    testFn: (s) => s === "\n",
    splitFn: (sps) => pipe(
        sps,
        Sp.insertLeft("\""),
        Sp.shiftLeft(1),
        E.map(Sp.insertLeft("\""))
    )
}

const intNewLineFn: Sm.StateFn =
    Sm.newStateGenFn("intNewLine")(intNewLineFnArgs)

const sepNewLinesMachine: Sm.Machine = {
	name: "Machine",
	stopId: "stop",
	transitions: new Map([
		["start", [extLetFn, startQuoteFn, stopFn] ],
		["extLet", [extLetFn, startQuoteFn, extNewLineFn, stopFn] ],
        ["startQuote", [intLetFn, endQuoteFn ] ],
        ["intLet", [intLetFn, endQuoteFn, intNewLineFn ]],
        ["endQuote", [ extLetFn, stopFn ]],
        ["extNewLine", [extNewLineFn, extLetFn, startQuoteFn, stopFn]],
        ["intNewLine", [endQuoteFn, intLetFn, stopFn]],
	]),
}

const defaultState: Sm.State = {
	name: "State",
	id: "",
	split: Sp.newSplitString("")("")
} 

const newStartState:
	(s: string) =>
	Sm.State =
	s => produce(defaultState, draft => {
		draft.id = "start",
		draft.split = Sp.newSplitString("")(s)
	})

export const sepNewLines:
	(s: string) =>
	E.Either<Err, string> = 
	s =>
	pipe(
		s,
		newStartState,
		Sm.interp(sepNewLinesMachine),
		E.map(Sp.getLeft) 
	)
