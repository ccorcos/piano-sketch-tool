import * as React from "react"
import { Piano } from "./Piano"
import { pianoWidth } from "./helpers"
import { MidiEmitter, MidiSelector } from "./Midi"
import { SequenceRecorder, MidiEvent, SequencePlayer } from "./Sequencer"
import { clearSongUrl, getSongUrl } from "./routeHelpers"
import { KeyboardShorcuts } from "./KeyboardShorcuts"

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
	midi = new MidiEmitter()

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
		this.midi.addListener(this.handleMidiNote)
	}

	componentWillUnmount() {
		this.midi.removeListener(this.handleMidiNote)
	}

	renderTopbar() {
		return (
			<div
				style={{ paddingBottom: 10, borderBottom: border, marginBottom: "2em" }}
			>
				<button style={{ marginRight: 4 }} onClick={this.handleNewSketch}>
					New Sketch (N)
				</button>
				{/* <button style={{ marginRight: 4 }}>Open Sketch (O)</button> */}

				<div style={{ fontSize: 14, float: "right" }}>
					<MidiSelector midi={this.midi} />
				</div>

				<a
					style={{ fontSize: 14, position: "fixed", bottom: 12, right: 16 }}
					href="https://www.github.com/ccorcos/piano-sketch-tool"
				>
					source code
				</a>
				<KeyboardShorcuts
					keydown={key => {
						if (key === "n") {
							this.handleNewSketch()
							return true
						} else if (key === "o") {
							// TODO:
						}
					}}
				/>
			</div>
		)
	}

	render() {
		return (
			<div style={{ margin: "2em auto", width: pianoWidth }}>
				{this.renderTopbar()}
				{this.renderInner()}
			</div>
		)
	}

	renderInner() {
		const state = this.state
		if (state.type === "recording") {
			return (
				<SequenceRecorder
					midi={this.midi}
					render={({ recording, start, stop, sequencer }) => {
						const handleStop = () => {
							const events = stop()
							this.setState({
								...this.state,
								type: "loaded",
								events,
							})
						}
						const handleRecord = () => {
							start()
							this.setState({
								...this.state,
								type: "recording",
							})
						}
						return (
							<div>
								<div style={{ marginBottom: 12 }}>
									{/* <div>
											<input
												style={{ marginBottom: 4 }}
												placeholder="Untitled Sketch"
											></input>
										</div> */}

									{recording ? (
										<button
											style={{ marginRight: 4, marginBottom: 16 }}
											onClick={handleStop}
										>
											Stop (SPACE)
										</button>
									) : (
										<>
											<button
												style={{ marginRight: 4, marginBottom: 16 }}
												onClick={handleRecord}
											>
												Record (SPACE)
											</button>
										</>
									)}

									<KeyboardShorcuts
										keydown={key => {
											if (key === " ") {
												if (recording) {
													handleStop()
													return true
												} else {
													handleRecord()
													return true
												}
											}
										}}
									/>
								</div>

								<Piano highlight={state.keys} />
								{sequencer}
							</div>
						)
					}}
				/>
			)
		} else {
			return (
				<SequencePlayer
					midi={this.midi}
					events={state.events}
					render={({
						playing,
						play,
						pause,
						restart,
						sequencer,
						speed,
						setSpeed,
					}) => (
						<div>
							<div style={{ marginBottom: 12 }}>
								{/* <div>
										<input
											style={{ marginBottom: 4 }}
											placeholder="Untitled Sketch"
										></input>
										<span style={{ marginLeft: 4, fontSize: 14 }}>
											2020-01-01 16:42
										</span>
									</div> */}

								{playing ? (
									<button style={{ width: 100 }} onClick={pause}>
										Pause (SPACE)
									</button>
								) : (
									<button style={{ width: 100 }} onClick={play}>
										Play (SPACE)
									</button>
								)}

								<span style={{ fontSize: 14, float: "right" }}>
									Share this link with a friend!
								</span>

								<button onClick={restart}>Restart (ENTER)</button>

								<KeyboardShorcuts
									keydown={key => {
										if (key === " ") {
											if (playing) {
												pause()
											} else {
												play()
											}
											return true
										} else if (key === "Enter") {
											restart()
											return true
										} else if (key === "ArrowRight") {
											setSpeed(speed + 0.25)
											return true
										} else if (key === "ArrowLeft") {
											setSpeed(speed - 0.25)
											return true
										}
									}}
								/>

								<div style={{ display: "inline-flex" }}>
									<span style={{ margin: "0 4px", fontSize: 14 }}>Speed:</span>
									<input
										type="range"
										min="0"
										max="300"
										value={speed * 100}
										onChange={(e: any) => setSpeed(e.target.value / 100)}
									/>
									<span style={{ margin: "0 4px", fontSize: 14 }}>{speed}</span>
								</div>
							</div>
							{sequencer}
							<Piano highlight={state.keys} />
						</div>
					)}
				/>
			)
		}
	}

	// ==============================================================
	// Events.
	// ==============================================================

	handleNewSketch = () => {
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
