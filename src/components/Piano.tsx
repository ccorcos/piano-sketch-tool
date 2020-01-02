import * as React from "react"
import * as _ from "lodash"

export function Piano(props: {}) {
	const width = 20
	const height = 80

	return (
		<div>
			<div style={{ position: "relative" }}>
				{_.range(0, 80).map(i => {
					const style: React.CSSProperties = {
						display: "inline-block",
						border: "1px solid black",
						boxSizing: "border-box",
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
							style.height = height
							style.width = width
							// style.background = "#ffffff"
						}
					}

					switch (note) {
						// Black Notes
						case 1:
						case 3:
						case 6:
						case 8:
						case 10: {
							style.height = height * 0.6
							style.width = width * 0.6
							style.marginBottom = height * 0.4
							style.background = "#000000"
							style.zIndex = 2
						}
					}

					switch (note) {
						// Black notes to the right
						case 0:
						case 2:
						case 5:
						case 7:
						case 9: {
							style.marginRight = -width * 0.3
						}
					}

					switch (note) {
						// Black notes to the left
						case 2:
						case 4:
						case 7:
						case 9:
						case 11: {
							style.marginLeft = -width * 0.3
						}
					}

					// style.background = `rgba(0,0,255,${0 * 50})`

					return <div key={i} style={style} />
				})}
			</div>
		</div>
	)
}
