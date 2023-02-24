import { Token, tokenize, TokenType } from "./tokenizer"

type JSONValue = JSONObject | JSONArray | string | number | boolean | null
type JSONObject = { [key: string]: JSONValue }
type JSONArray = JSONValue[]

export const parse = (text: string): any => {
	const tokens = tokenize(text)

	let index = 0

	const consume = <T extends TokenType>(type: T): Token<T> => {
		if (tokens[index].type !== type) {
			throw new Error(`Unexpected token ${tokens[index].type} at index ${index}`)
		}

		index++

		return tokens[index - 1] as Token<T>
	}

	const parseString = (): string => {
		const token = consume("string")

		return token.value
	}

	const parseNumber = (): number => {
		const token = consume("number")

		return token.value
	}

	const parseHex = (): number => {
		const token = consume("hex")

		return token.value
	}

	const parseOctal = (): number => {
		const token = consume("octal")

		return token.value
	}

	const parseBool = (): boolean => {
		const token = consume("bool")

		return token.value
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

	// check first token to see if it's an object or array, or something else
	const token = tokens[index]

	switch (token.type) {
		case "opencurly":
			return parseObject()
		case "openarray":
			return parseArray()
		case "eof":
			throw new Error("Unexpected end of input")
		case "string":
		case "number":
		case "hex":
		case "octal":
		case "bool":
		case "null":
			return parseValue()
		default:
			throw new Error(`Unexpected token ${token.type} at index ${index}`)
	}

	throw new Error("Unreachable")
}
