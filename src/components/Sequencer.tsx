import * as React from "react"
import {
	getXPosition,
	isBlackNote,
	blackNoteWidth,
	whiteNoteWidth,
	blackNoteColor,
	whiteNoteColor,
	pixelsPerMillisecond,
	windowHeight,
	getPianoWidth,
	pianoSize,
} from "./helpers"
import { ComputerMidiSource } from "./MidiSource"

type CompletedNote = {
	midiNote: number
	startMs: number
	endMs: number
	elm: HTMLDivElement
}

type IncompletedNote = {
	midiNote: number
	startMs: number
	elm: HTMLDivElement
}

type SequencerState = {
	root: HTMLDivElement
	completedNotes: Array<CompletedNote>
	incompleteNotes: Array<IncompletedNote>
}

type MidiEvent = {
	keyOn: boolean
	midiNote: number
	timeMs: number
}

export class SequencerRenderer {
	state: SequencerState

	constructor(div: HTMLDivElement) {
		div.style.position = "absolute"
		div.style.bottom = "0px"
		div.style.left = "0px"
		div.style.right = "0px"
		div.style.height = "0px"
		this.state = {
			root: div,
			completedNotes: [],
			incompleteNotes: [],
		}
	}

	stopped = false

	stop() {
		this.stopped = true
	}

	start(startMs: number) {
		this.stopped = false
		const tick = () => {
			if (this.stopped) {
				return
			}
			const timeMs = Date.now() - startMs
			this.state.root.style.height = `${timeMs * pixelsPerMillisecond}px`
			requestAnimationFrame(tick)
		}
		requestAnimationFrame(tick)
	}

	handleEvent(event: MidiEvent) {
		const { keyOn, midiNote, timeMs } = event

		if (keyOn) {
			const div = document.createElement("div")
			div.style.position = "absolute"
			const xPos = getXPosition(midiNote)
			div.style.left = `${xPos}px`
			div.style.top = `${timeMs * pixelsPerMillisecond}px`
			div.style.bottom = "0px"

			div.style.width = isBlackNote(midiNote)
				? `${blackNoteWidth}px`
				: `${whiteNoteWidth}px`
			div.style.background = isBlackNote(midiNote)
				? blackNoteColor
				: whiteNoteColor

			this.state.root.appendChild(div)

			this.state.incompleteNotes.push({
				midiNote,
				startMs: timeMs,
				elm: div,
			})
		} else {
			const i = this.state.incompleteNotes.findIndex(
				note => note.midiNote === midiNote
			)
			if (i !== -1) {
				const [note] = this.state.incompleteNotes.splice(i, 1)
				note.elm.style.bottom = `${timeMs * pixelsPerMillisecond}px`
				this.state.completedNotes.push({ ...note, endMs: timeMs })
			}
		}
	}
}

interface SequenceRecorderProps {
	source: ComputerMidiSource
}

export class SequenceRecorder extends React.PureComponent<
	SequenceRecorderProps
> {
	startMs = Date.now()
	componentDidMount() {
		this.props.source.addListener(this.handleMidiNote)
	}

	componentWillUnmount() {
		this.props.source.removeListener(this.handleMidiNote)
		if (this.renderer) {
			this.renderer.stop()
		}
	}

	private renderer: SequencerRenderer | undefined

	private handleRef = (div: HTMLDivElement | null) => {
		if (div) {
			this.renderer = new SequencerRenderer(div)
			this.renderer.start(this.startMs)
		}
	}

	private handleMidiNote = (keyOn: boolean, midiNote: number) => {
		if (this.renderer) {
			this.renderer.handleEvent({
				keyOn,
				midiNote,
				timeMs: Date.now() - this.startMs,
			})
		}
	}

	render() {
		return (
			<div
				ref={this.handleRef}
				style={{
					overflow: "auto",
					height: windowHeight,
					border: "1px solid black",
					boxSizing: "border-box",
					width: getPianoWidth(pianoSize - 1),
					position: "relative",
				}}
			></div>
		)
	}
}
