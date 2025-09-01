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

const extLetFn: Sm.StateFn = 
    Sm.newStateShiftFn(1)
    (s => pipe( 
        s.match(/^[a-z0-9]+$/i),
        str => str !== null,
    ))
    ("Not a letter")
    ("extLet")

const sepNewLinesMachine: Sm.Machine = {
	name: "Machine",
	stopId: "stop",
	transitions: new Map([
		["start", [extLetFn, stopFn] ],
		["extLet", [extLetFn, stopFn] ],
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
		E.map(sps => sps.sep.left) // TODO clean and add an empty check
	)
