import { pipe } from 'fp-ts/lib/function.js' 
import * as B from "fp-ts/lib/boolean.js"
import * as Ps from "./index.js"
import { expect } from "chai"
import * as Op from "fp-ts/lib/Option.js"
import * as E from "fp-ts/lib/Either.js" 
import * as A from "fp-ts/lib/Array.js"
import * as SE from "fp-ts/lib/Separated.js"
import * as EqTo from "eq-to/dist/index.js"
import { produce } from "immer"

describe("state manipulation tests", () => {

    const compareFn = 
        (inStr: string) =>
        (outStr: string) =>
        pipe(
			inStr,
			Ps.sepNewLines,
			(s) => [s, E.right(outStr)],
			EqTo.checkEither( Ps.errEq, EqTo.basicEq ),
			EqTo.toBool, 
			b => expect(b).to.equal(true),
		)


    const printFn =
        (inStr: string) =>
        pipe(
            inStr,
            Ps.sepNewLines,
            console.log 
        )
        

	it("empty string", () => {
        const inStr = ""
        const outStr = ""
        compareFn(inStr)(outStr)
	})

	it("Non-Quote Letters", () => {
        const inStr = "abc"
        const outStr = "abc"
        compareFn(inStr)(outStr)
	})

	it("Letters within quote", () => {
        const inStr = "\"abc\""
        const outStr = "\"abc\""
        compareFn(inStr)(outStr)
	})
	it("letters before and after quote", () => {
        const inStr = "abc\"def\"ghi"
        const outStr = "abc\"def\"ghi"
        compareFn(inStr)(outStr)
	})

	it("newline with letters before and after ", () => {
        const inStr = "abc\ndef"
        const outStr = "abc\ndef"
        compareFn(inStr)(outStr)
	})

    it("can seperate a quote with newline into two quotes", () => {
        const inStr = "\"abc\ndef\""
        const outStr = "\"abc\"\n\"def\""
        compareFn(inStr)(outStr)
    })
})
