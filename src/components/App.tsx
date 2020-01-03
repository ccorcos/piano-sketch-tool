import * as React from "react"
import { Piano } from "./Piano"
import {
	getPianoWidth,
	pianoSize,
	windowHeight,
	pixelsPerMillisecond,
	isBlackNote,
	whiteNoteWidth,
	blackNoteWidth,
	whiteNoteColor,
	blackNoteColor,
	getXPosition,
} from "./helpers"
import { ComputerMidiSource } from "./MidiSource"
import { SequenceRecorder } from "./Sequencer"

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

	source = new ComputerMidiSource()

	componentWillMount() {
		this.source.start()
		this.source.addListener(this.handleMidiNote)
	}

	componentWillUnmount() {
		this.source.stop()
	}

	render() {
		return (
			<div>
				{/* {this.state.isRecording ? (
					<button>stop</button>
				) : (
					<button onClick={this.handleStartRecording}>start</button>
				)} */}

				<SequenceRecorder source={this.source} />
				<Piano highlight={this.state.keys} size={pianoSize} />
			</div>
		)
	}

	// ==============================================================
	// Events.
	// ==============================================================

	private handleMidiNote = (on: boolean, midiNote: number) => {
		const newKeys = new Set(this.state.keys)
		if (on) {
			newKeys.add(midiNote)
		} else {
			newKeys.delete(midiNote)
		}
		this.setState({
			...this.state,
			keys: newKeys,
		})
	}
}
