import * as React from "react"
import { Piano } from "./Piano"
import { pianoSize } from "./helpers"
import { WebMidiSource } from "./MidiSource"
import { SequenceRecorder, MidiEvent, SequencePlayer } from "./Sequencer"
import { clearSongUrl, getSongUrl } from "./routeHelpers"

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
	source = new WebMidiSource()

	constructor(props) {
		super(props)
		const events = getSongUrl(location.href)
		if (events) {
			this.state = {
				...this.state,
				type: "loaded",
				events: events,
			}
		}
	}

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
					<SequencePlayer events={state.events} onClear={this.handleReset} />
					<Piano highlight={state.keys} size={pianoSize} />
				</div>
			)
		}
	}

	// ==============================================================
	// Events.
	// ==============================================================

	private handleReset = () => {
		clearSongUrl()
		this.setState({
			...this.state,
			type: "start",
		})
	}

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
