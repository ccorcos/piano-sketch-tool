import * as React from "react"
import * as _ from "lodash"

import {
	whiteNoteWidth,
	whiteNoteHeight,
	blackNoteHeight,
	blackNoteWidth,
	whiteNoteColor,
	blackNoteColor,
	getXPosition,
	pianoWidth,
	midiRange,
} from "./helpers"

export function Piano(props: { highlight: Set<number> }) {
	return (
		<div
			style={{
				position: "relative",
				height: whiteNoteHeight,
				width: pianoWidth,
			}}
		>
			{_.range(midiRange.start, midiRange.end + 1).map(i => {
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
							style.background = whiteNoteColor
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
							style.background = blackNoteColor
						}
					}
				}

				return <div key={i} style={style} />
			})}
		</div>
	)
}
