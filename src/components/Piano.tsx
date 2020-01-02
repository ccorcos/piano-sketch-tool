import * as React from "react"
import * as _ from "lodash"

// TODO: should probably use positino absolute so they don't overlap weird.

const whiteNoteWidth = 20
const whiteNoteHeight = 80
const blackNoteHeight = whiteNoteHeight * 0.6
const blackNoteWidth = whiteNoteWidth * 0.6

function getXPosition(midiNote: number) {
	const offset = Math.floor(midiNote / 12) * whiteNoteWidth * 7

	const note = midiNote % 12
	switch (note) {
		// White Notes
		case 0: {
			const xPosition = offset + 0 * whiteNoteWidth
			return xPosition
		}
		case 2: {
			const xPosition = offset + 1 * whiteNoteWidth
			return xPosition
		}
		case 4: {
			const xPosition = offset + 2 * whiteNoteWidth
			return xPosition
		}
		case 5: {
			const xPosition = offset + 3 * whiteNoteWidth
			return xPosition
		}
		case 7: {
			const xPosition = offset + 4 * whiteNoteWidth
			return xPosition
		}
		case 9: {
			const xPosition = offset + 5 * whiteNoteWidth
			return xPosition
		}
		case 11: {
			const xPosition = offset + 6 * whiteNoteWidth
			return xPosition
		}
		// Black Notes
		case 1: {
			const xPosition = offset + whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 3: {
			const xPosition = offset + 2 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 6: {
			const xPosition = offset + 4 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 8: {
			const xPosition = offset + 5 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 10: {
			const xPosition = offset + 6 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
	}
}

export function Piano(props: { highlight: Set<number> }) {
	return (
		<div>
			<div style={{ position: "relative" }}>
				{_.range(0, 80).map(i => {
					const style: React.CSSProperties = {
						position: "absolute",
						border: "1px solid black",
						boxSizing: "border-box",
						top: 0,
						left: getXPosition(i),
					}

					const note = i % 12
					switch (note) {
						// White Notes
						case 0:
						case 2:
						case 4:
						case 5:
						case 7:
						case 9:
						case 11: {
							style.height = whiteNoteHeight
							style.width = whiteNoteWidth
							if (props.highlight.has(i)) {
								style.background = "#7B9EFA"
							}
						}
					}

					switch (note) {
						// Black Notes
						case 1:
						case 3:
						case 6:
						case 8:
						case 10: {
							style.height = blackNoteHeight
							style.width = blackNoteWidth
							style.background = "#000000"
							style.zIndex = 2
							if (props.highlight.has(i)) {
								style.background = "#5C75B4"
							}
						}
					}

					return <div key={i} style={style} />
				})}
			</div>
		</div>
	)
}
