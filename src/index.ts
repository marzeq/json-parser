import { parse } from "./parser"
import isEqual from "lodash.isequal"

const assert = (condition: boolean, message?: string) => {
	if (!condition) {
		console.error(`Assertion failed${message ? `: ${message}` : ""}`)
		process.exit(1)
	}
}

assert(isEqual(parse(`"value"`), "value"), "String parse test")
assert(isEqual(parse(`123`), 123), "Number parse test")
assert(isEqual(parse(`0x123`), 291), "Hex parse test")
assert(isEqual(parse(`0o123`), 83), "Octal parse test")
assert(isEqual(parse(`true`), true), "True parse test")
assert(isEqual(parse(`false`), false), "False parse test")
assert(isEqual(parse(`null`), null), "Null parse test")
assert(isEqual(parse(`[]`), []), "Empty array parse test")
assert(isEqual(parse(`[1, 2, 3]`), [1, 2, 3]), "Array parse test")
assert(isEqual(parse(`{}`), {}), "Empty object parse test")
assert(isEqual(parse(`[1,]`), [1]), "Trailing comma parse test")

assert(
	isEqual(
		parse(
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
	"Full parse test"
)

console.log("All tests passed")
