import * as React from "react"
import { Piano } from "./Piano"

const keyMap = {
	a: 0,
	w: 1,
	s: 2,
	e: 3,
	d: 4,
	f: 5,
	t: 6,
	g: 7,
	y: 8,
	h: 9,
	u: 10,
	j: 11,
	k: 12,
	o: 13,
	l: 14,
	p: 15,
	";": 16,
	"'": 17,
}

export function App() {
	const [keys, setKeys] = React.useState(new Set<number>())

	React.useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key in keyMap) {
				const newKeys = new Set(keys)
				newKeys.add(keyMap[event.key])
				setKeys(newKeys)
			}
		}
		const handleKeyUp = (event: KeyboardEvent) => {
			if (event.key in keyMap) {
				const newKeys = new Set(keys)
				newKeys.delete(keyMap[event.key])
				setKeys(newKeys)
			}
		}
		window.addEventListener("keydown", handleKeyDown)
		window.addEventListener("keyup", handleKeyUp)
		return () => {
			window.removeEventListener("keydown", handleKeyDown)
			window.removeEventListener("keyup", handleKeyUp)
		}
	})

	return (
		<div>
			<h1>Hello World</h1>
			<Piano highlight={keys} />
		</div>
	)
}
