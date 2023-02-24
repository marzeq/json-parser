type NoValueToken = "opencurly" | "closecurly" | "openarray" | "closearray" | "colon" | "comma" | "null" | "eof"
export type TokenType = "string" | "number" | "hex" | "octal" | "bool" | NoValueToken

export type Token<T extends TokenType> = {
	type: T
	position: number
	length: number
} & (T extends "string"
	? { value: string }
	: T extends "number" | "hex" | "octal"
	? { value: number }
	: T extends "bool"
	? { value: boolean }
	: T extends NoValueToken
	? {}
	: never)

export type GenericToken = Token<TokenType>

type Tokenizer = {
	index: number
	tokenized: GenericToken[]
	context: string
	peek: () => GenericToken
	next: () => GenericToken
}

const tokenizer = (context: string): Tokenizer => ({
	index: 0,
	tokenized: [],
	context,
	peek() {
		const text = this.context.slice(this.index)

		const eof = {
			type: "eof",
			position: this.index,
			length: 0
		} as const

		if (text.length === 0) {
			return eof
		}

		const openCurlyMatch = text.match(/^\{/),
			closeCurlyMatch = text.match(/^\}/),
			openArrayMatch = text.match(/^\[/),
			closeArrayMatch = text.match(/^\]/),
			colonMatch = text.match(/^:/),
			stringMatch = text.match(/^"([^\\]*?(?:\\.[^\\]*?)*)"/),
			hexMatch = text.match(/^0x([0-9a-fA-F]+)/),
			octalMatch = text.match(/^0o([0-7]+)/),
			numberMatch = text.match(/^([0-9]+)/),
			nullMatch = text.match(/^null/),
			boolMatch = text.match(/^(true|false)/),
			commaMatch = text.match(/^,/),
			whitespaceMatch = text.match(/^\s+/)

		if (openCurlyMatch || closeCurlyMatch || openArrayMatch || closeArrayMatch || colonMatch || commaMatch) {
			return {
				type: openCurlyMatch
					? "opencurly"
					: closeCurlyMatch
					? "closecurly"
					: openArrayMatch
					? "openarray"
					: closeArrayMatch
					? "closearray"
					: commaMatch
					? "comma"
					: "colon",
				position: this.index,
				length: 1
			}
		} else if (stringMatch) {
			return {
				type: "string",
				position: this.index,
				length: stringMatch[0].length,
				value: stringMatch[1]
			}
		} else if (hexMatch) {
			const parsed = parseInt(hexMatch[1], 16)

			if (isNaN(parsed)) {
				return eof
			}

			return {
				type: "hex",
				position: this.index,
				length: hexMatch[0].length,
				value: parsed
			}
		} else if (octalMatch) {
			const parsed = parseInt(octalMatch[1], 8)

			if (isNaN(parsed)) {
				return eof
			}

			return {
				type: "octal",
				position: this.index,
				length: octalMatch[0].length,
				value: parsed
			}
		} else if (numberMatch) {
			const parsed = parseInt(numberMatch[1])

			if (isNaN(parsed)) {
				return eof
			}

			return {
				type: "number",
				position: this.index,
				length: numberMatch[0].length,
				value: parseInt(numberMatch[1])
			}
		} else if (nullMatch) {
			return {
				type: "null",
				position: this.index,
				length: 4
			}
		} else if (boolMatch) {
			return {
				type: "bool",
				position: this.index,
				length: boolMatch[0].length,
				value: boolMatch[1] === "true"
			}
		} else if (whitespaceMatch) {
			this.index += whitespaceMatch[0].length
			return this.peek()
		}

		return eof
	},
	next() {
		const peeked = this.peek()

		this.index += peeked.length

		this.tokenized.push(peeked)

		return peeked
	}
})

export const tokenize = (text: string) => {
	const tok = tokenizer(text)

	while (true) {
		const token = tok.next()

		if (token.type === "eof") {
			break
		}
	}
	return tok.tokenized
}
