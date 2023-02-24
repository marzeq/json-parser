import { Token, tokenize, TokenType } from "./tokenizer"

type JSONValue = JSONObject | JSONArray | string | number | boolean | null
type JSONObject = { [key: string]: JSONValue }
type JSONArray = JSONValue[]

export const parse = (text: string): any => {
	const tokens = tokenize(text)

	let index = 0

	const consume = (type: TokenType) => {
		if (tokens[index].type !== type) {
			throw new Error(`Unexpected token ${tokens[index].type} at index ${index}`)
		}

		index++

		return tokens[index - 1]
	}

	const parseString = (): string => {
		const token = consume("string")

		return (token as Token<"string">).value
	}

	const parseNumber = (): number => {
		const token = consume("number")

		return (token as Token<"number">).value
	}

	const parseHex = (): number => {
		const token = consume("hex")

		return (token as Token<"hex">).value
	}

	const parseOctal = (): number => {
		const token = consume("octal")

		return (token as Token<"octal">).value
	}

	const parseBool = (): boolean => {
		const token = consume("bool")

		return (token as Token<"bool">).value
	}

	const parseNull = (): null => {
		consume("null")

		return null
	}

	const parseValue = (): any => {
		const token = tokens[index]

		switch (token.type) {
			case "string":
				return parseString()
			case "number":
				return parseNumber()
			case "hex":
				return parseHex()
			case "octal":
				return parseOctal()
			case "bool":
				return parseBool()
			case "null":
				return parseNull()
			case "opencurly":
				return parseObject()
			case "openarray":
				return parseArray()
			default:
				throw new Error(`Unexpected token ${token.type} at index ${index}`)
		}
	}

	const parseObject = (): { [key: string]: any } => {
		const obj: { [key: string]: any } = {}

		consume("opencurly")

		while (tokens[index].type !== "closecurly") {
			const key = parseString()

			consume("colon")

			const value = parseValue()

			obj[key] = value

			if (tokens[index].type === "comma") {
				consume("comma")
			} else if (tokens[index].type !== "closecurly") {
				throw new Error(`Unexpected token ${tokens[index].type} at index ${index}`)
			}
		}

		consume("closecurly")

		return obj
	}

	const parseArray = (): any[] => {
		const arr: any[] = []

		consume("openarray")

		while (tokens[index].type !== "closearray") {
			const value = parseValue()

			arr.push(value)

			if (tokens[index].type === "comma") {
				consume("comma")
			} else if (tokens[index].type !== "closearray") {
				throw new Error(`Unexpected token ${tokens[index].type} at index ${index}`)
			}
		}

		consume("closearray")

		return arr
	}

	return parseObject()
}
