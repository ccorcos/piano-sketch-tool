import * as React from "react"
import { Piano } from "./Piano"
import {
	getPianoWidth,
	pianoSize,
	sequencerHeight,
	pixelsPerMillisecond,
	isBlackNote,
	whiteNoteWidth,
	blackNoteWidth,
	whiteNoteColor,
	blackNoteColor,
	getXPosition,
} from "./helpers"
import { ComputerMidiSource } from "./MidiSource"
import { SequenceRecorder, MidiEvent, SequencePlayer } from "./Sequencer"

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
			type: "start"
			keys: Set<number>
	  }
	| {
			type: "recording"
			keys: Set<number>
	  }
	| {
			type: "loaded"
			keys: Set<number>
			events: Array<MidiEvent>
	  }

export class App extends React.PureComponent<{}, AppState> {
	state: AppState = { type: "start" as const, keys: new Set<number>() }
	source = new ComputerMidiSource()

	componentWillMount() {
		this.source.start()
		this.source.addListener(this.handleMidiNote)
	}

	componentWillUnmount() {
		this.source.stop()
	}

	render() {
		const state = this.state
		if (state.type === "start") {
			return (
				<div>
					<button onClick={this.handleStartRecording}>record</button>
					<Piano highlight={state.keys} size={pianoSize} />
				</div>
			)
		} else if (state.type === "recording") {
			return (
				<div>
					<Piano highlight={state.keys} size={pianoSize} />
					<SequenceRecorder
						source={this.source}
						handleStop={this.handleStopRecording}
					/>
				</div>
			)
		} else {
			return (
				<div>
					<SequencePlayer events={state.events} />
					<Piano highlight={state.keys} size={pianoSize} />
				</div>
			)
		}
	}

	// ==============================================================
	// Events.
	// ==============================================================

	private handleStopRecording = (events: Array<MidiEvent>) => {
		this.setState({
			...this.state,
			type: "loaded",
			events,
		})
	}

	private handleStartRecording = () => {
		this.setState({
			...this.state,
			type: "recording",
		})
	}

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
