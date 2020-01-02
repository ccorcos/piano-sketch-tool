import * as React from "react"
import {
	Piano,
	getPianoWidth,
	isBlackNote,
	whiteNoteWidth,
	blackNoteWidth,
	whiteNoteColor,
	blackNoteColor,
	getXPosition,
} from "./Piano"

const pianoSize = 18
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

type AppState =
	| {
			keys: Set<number>
			isRecording: false
	  }
	| {
			keys: Set<number>
			isRecording: true
			startTime: number
			currentTime: number
			notes: Array<
				| { type: "up"; midiNote: number; time: number }
				| { type: "down"; midiNote: number; time: number }
			>
	  }

export class App extends React.PureComponent<{}, AppState> {
	state = { keys: new Set(), isRecording: false } as AppState

	componentWillMount() {
		window.addEventListener("keydown", this.handleKeyDown)
		window.addEventListener("keyup", this.handleKeyUp)
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.handleKeyDown)
		window.removeEventListener("keyup", this.handleKeyUp)
	}

	render() {
		return (
			<div>
				{this.state.isRecording ? (
					<button>stop</button>
				) : (
					<button onClick={this.handleStartRecording}>start</button>
				)}

				{this.renderTraces()}
				<Piano highlight={this.state.keys} size={pianoSize} />
			</div>
		)
	}

	private renderTraces() {
		const traces: Array<JSX.Element> = []

		const height = 200
		const pixelsPerMillisecond = height / 2500

		if (!this.state.isRecording) {
			return false
		}

		const { notes, currentTime, startTime } = this.state
		for (let i = 0; i < notes.length; i++) {
			const downNote = notes[i]
			if (downNote.type === "down") {
				let end = currentTime
				for (let j = i + 1; j < notes.length; j++) {
					const endNode = notes[j]
					if (endNode.type === "up" && endNode.midiNote === downNote.midiNote) {
						end = endNode.time
						break
					}
				}

				const start = downNote.time

				const style: React.CSSProperties = {}

				if (isBlackNote(downNote.midiNote)) {
					style.width = blackNoteWidth
					style.background = blackNoteColor
				} else {
					style.width = whiteNoteWidth
					style.background = whiteNoteColor
				}

				style.height = (end - start) * pixelsPerMillisecond
				style.position = "absolute"
				style.left = getXPosition(downNote.midiNote)
				style.top = start * pixelsPerMillisecond

				traces.push(
					<div key={`${downNote.midiNote}-${start}-${end}`} style={style}></div>
				)
			}
		}

		return (
			<div
				style={{
					overflow: "auto",
					height: height,
					border: "1px solid black",
					boxSizing: "border-box",
					width: getPianoWidth(pianoSize - 1),
					position: "relative",
				}}
			>
				<div
					style={{
						position: "absolute",
						bottom: 0,
						left: 0,
						right: 0,
						height: (currentTime - startTime) * pixelsPerMillisecond,
					}}
				>
					{traces}
				</div>
			</div>
		)
	}

	// ==============================================================
	// Events.
	// ==============================================================

	private handleKeyDown = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			const newKeys = new Set(this.state.keys)
			const midiNote = keyMap[event.key]
			newKeys.add(midiNote)
			this.setState({
				...this.state,
				keys: newKeys,
			})
			if (this.state.isRecording) {
				this.state.notes.push({
					type: "down",
					midiNote,
					time: Date.now() - this.state.startTime,
				})
			}
		}
	}
	private handleKeyUp = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			const newKeys = new Set(this.state.keys)
			const midiNote = keyMap[event.key]
			newKeys.delete(midiNote)
			this.setState({
				...this.state,
				keys: newKeys,
			})
			if (this.state.isRecording) {
				this.state.notes.push({
					type: "up",
					midiNote,
					time: Date.now() - this.state.startTime,
				})
			}
		}
	}

	private handleStartRecording = () => {
		const time = Date.now()
		this.setState({
			...this.state,
			isRecording: true,
			startTime: time,
			currentTime: time,
			notes: [],
		})

		const loop = () => {
			if (this.state.isRecording) {
				this.tick()
				requestAnimationFrame(loop)
			}
		}
		requestAnimationFrame(loop)
	}

	private tick = () => {
		if (this.state.isRecording) {
			const time = Date.now()
			this.setState({
				...this.state,
				currentTime: time,
			})
		}
	}
}
