import * as React from "react"
import { Piano } from "./Piano"
import { pianoSize, getPianoWidth } from "./helpers"
import { WebMidiSource } from "./MidiSource"
import { SequenceRecorder, MidiEvent, SequencePlayer } from "./Sequencer"
import { clearSongUrl, getSongUrl } from "./routeHelpers"

const border = "1px solid #B8B8B8"

type AppState =
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
	state: AppState = { type: "recording" as const, keys: new Set<number>() }
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

	renderTopbar() {
		return (
			<div
				style={{ paddingBottom: 10, borderBottom: border, marginBottom: "2em" }}
			>
				<button style={{ marginRight: 4 }}>New Sketch (N)</button>
				<button style={{ marginRight: 4 }}>Open Sketch (O)</button>
			</div>
		)
	}

	render() {
		const state = this.state
		if (state.type === "recording") {
			return (
				<div style={{ margin: "2em auto", width: getPianoWidth(pianoSize) }}>
					<SequenceRecorder
						source={this.source}
						render={({ recording, start, stop, sequencer }) => (
							<div>
								{this.renderTopbar()}

								<div>
									<input
										style={{ marginBottom: 4 }}
										placeholder="Untitled Sketch"
									></input>
								</div>
								{recording ? (
									<button
										style={{ marginRight: 4, marginBottom: 16 }}
										onClick={() => {
											const events = stop()
											this.setState({
												...this.state,
												type: "loaded",
												events,
											})
										}}
									>
										Stop (SPACE)
									</button>
								) : (
									<button
										style={{ marginRight: 4, marginBottom: 16 }}
										onClick={() => {
											const events = start()
											this.setState({
												...this.state,
												type: "recording",
											})
										}}
									>
										Record (SPACE)
									</button>
								)}

								<Piano highlight={state.keys} size={pianoSize} />
								{sequencer}
							</div>
						)}
					/>
				</div>
			)
		} else {
			return (
				<div style={{ margin: "2em auto", width: getPianoWidth(pianoSize) }}>
					{this.renderTopbar()}
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
