import { parse } from "./parser"

console.log(
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
	)
)
