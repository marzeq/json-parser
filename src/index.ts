import { parse } from "./parser"
import isEqual from "lodash.isequal"

const safeParse = (text: string) => {
	try {
		return parse(text)
	} catch {
		return undefined
	}
}

let anyFailed = false

const test = (condition: boolean, message?: string) => {
	if (!condition) {
		console.error(`✘ | Failed${message ? `: ${message}` : ""}`)
		anyFailed = true
	} else {
		console.log(`✓ | Passed${message ? `: ${message}` : ""}`)
	}
}

test(isEqual(safeParse(`"value"`), "value"), "String parse")
test(isEqual(safeParse(`123`), 123), "Number parse")
test(isEqual(safeParse(`0x123`), 291), "Hex parse")
test(isEqual(safeParse(`0o123`), 83), "Octal parse")
test(isEqual(safeParse(`true`), true), "True parse")
test(isEqual(safeParse(`false`), false), "False parse")
test(isEqual(safeParse(`null`), null), "Null parse")
test(isEqual(safeParse(`[]`), []), "Empty array parse")
test(isEqual(safeParse(`[1, 2, 3]`), [1, 2, 3]), "Array parse")
test(isEqual(safeParse(`{}`), {}), "Empty object parse")
test(isEqual(safeParse(`[1,]`), [1]), "Trailing comma parse")

test(
	isEqual(
		safeParse(
			`{
	"key": "value",
	"key2": 123,
	"key3": true,
	"key4": false,
	"key5": null,
	"key6": [1, 2, 3],
	"key7": {
		"key8": "value"
	},
	"key9": 0x123,
	"key10": 0o123
}`
		),
		{
			key: "value",
			key2: 123,
			key3: true,
			key4: false,
			key5: null,
			key6: [1, 2, 3],
			key7: { key8: "value" },
			key9: 291,
			key10: 83
		}
	),
	"Full parse"
)

if (!anyFailed) {
	console.log("\n✓ | All tests passed")
}
