import * as _ from "lodash"
import * as React from "react"
import {
	getXPosition,
	isBlackNote,
	blackNoteWidth,
	whiteNoteWidth,
	blackNoteColor,
	whiteNoteColor,
	pixelsPerMillisecond,
	sequencerHeight,
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
	events: Array<MidiEvent>
}

export type MidiEvent = {
	keyOn: boolean
	midiNote: number
	timeMs: number
}

export class SequencerRenderer {
	state: SequencerState

	constructor(div: HTMLDivElement) {
		div.style.position = "absolute"
		div.style.top = "0px"
		div.style.left = "0px"
		div.style.right = "0px"
		div.style.height = "0px"
		this.state = {
			root: div,
			completedNotes: [],
			incompleteNotes: [],
			events: [],
		}
	}

	recording = false

	stopRecording() {
		this.recording = false
	}

	startMs: number | undefined
	startRecording(startMs: number) {
		this.startMs = startMs
		this.recording = true
		const tick = () => {
			if (!this.recording) {
				return
			}
			const timeMs = Date.now() - startMs
			this.state.root.style.height = `${timeMs * pixelsPerMillisecond}px`
			requestAnimationFrame(tick)
		}
		requestAnimationFrame(tick)
	}

	load(events: Array<MidiEvent>) {
		for (const event of events) {
			this.handleEvent(event)
		}
		const maxMs = _.max(this.state.events.map(e => e.timeMs)) || 0
		const height = maxMs * pixelsPerMillisecond
		this.state.root.style.height = `${height}px`
		this.state.root.style.position = "relative"
		this.state.root.style.paddingTop = `${sequencerHeight}px`
		this.state.root.parentElement!.scrollTop = height

		history.pushState(
			{},
			"",
			"/?song=" + encodeURIComponent(JSON.stringify(events))
		)
	}

	playing = false
	startPlaying(speed: number = 1, finished?: () => void) {
		let prev = Date.now()
		this.playing = true
		const tick = () => {
			if (!this.playing) {
				return
			}
			if (this.state.root.parentElement!.scrollTop <= 0) {
				this.stopPlaying()
				if (finished) {
					finished()
				}
				return
			}
			const dt = Date.now() - prev
			prev = Date.now()

			this.state.root.parentElement!.scrollTop =
				this.state.root.parentElement!.scrollTop -
				pixelsPerMillisecond * dt * speed
			requestAnimationFrame(tick)
		}
		requestAnimationFrame(tick)
	}

	stopPlaying() {
		this.playing = false
	}

	handleEvent(event: MidiEvent) {
		const { keyOn, midiNote, timeMs } = event
		this.state.events.push(event)

		if (keyOn) {
			const i = this.state.incompleteNotes.findIndex(
				note => note.midiNote === midiNote
			)
			if (i !== -1) {
				// Handle key-repeat
				return
			}

			const div = document.createElement("div")
			div.style.position = "absolute"
			const xPos = getXPosition(midiNote)
			div.style.left = `${xPos}px`
			div.style.bottom = `${timeMs * pixelsPerMillisecond}px`
			div.style.top = "0px"

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
				note.elm.style.top = null as any
				note.elm.style.height = `${(timeMs - note.startMs) *
					pixelsPerMillisecond}px`
				this.state.completedNotes.push({ ...note, endMs: timeMs })
			} else {
				console.log("missing!")
			}
		}
	}
}

interface SequencerProps {
	onMount: (renderer: SequencerRenderer) => void
}

export class Sequencer extends React.PureComponent<SequencerProps> {
	private renderer: SequencerRenderer | undefined

	private handleRef = (div: HTMLDivElement | null) => {
		if (div) {
			this.renderer = new SequencerRenderer(div)
			this.props.onMount(this.renderer)
		}
	}

	render() {
		return (
			<React.Fragment>
				<div
					style={{
						overflow: "auto",
						height: sequencerHeight,
						border: "1px solid black",
						boxSizing: "border-box",
						width: getPianoWidth(pianoSize - 1),
						position: "relative",
					}}
				>
					<div ref={this.handleRef}></div>
				</div>
			</React.Fragment>
		)
	}
}

interface SequenceRecorderProps {
	source: ComputerMidiSource
	handleStop: (events: Array<MidiEvent>) => void
}

export class SequenceRecorder extends React.PureComponent<
	SequenceRecorderProps
> {
	private renderer: SequencerRenderer | undefined

	private handleMount = (renderer: SequencerRenderer) => {
		this.renderer = renderer
		this.handleStart()
	}

	private handleStart = () => {
		if (this.renderer) {
			this.props.source.addListener(this.handleMidiNote)
			this.renderer.startRecording(Date.now())
		}
	}

	private handleStop = () => {
		this.props.source.removeListener(this.handleMidiNote)
		if (this.renderer) {
			this.renderer.stopRecording()
			this.props.handleStop(this.renderer.state.events)
		}
	}

	private handleMidiNote = (keyOn: boolean, midiNote: number) => {
		if (this.renderer && this.renderer.startMs) {
			this.renderer.handleEvent({
				keyOn,
				midiNote,
				timeMs: Date.now() - this.renderer.startMs,
			})
		}
	}

	render() {
		return (
			<React.Fragment>
				<Sequencer onMount={this.handleMount} />
				<button onClick={this.handleStop}>stop</button>
			</React.Fragment>
		)
	}
}

interface SequencePlayerProps {
	events: Array<MidiEvent>
}

interface SequencePlayerState {
	playing: boolean
	speed: number
}

export class SequencePlayer extends React.PureComponent<
	SequencePlayerProps,
	SequencePlayerState
> {
	state: SequencePlayerState = {
		playing: false,
		speed: 1,
	}

	private renderer: SequencerRenderer | undefined

	private handleMount = (renderer: SequencerRenderer) => {
		this.renderer = renderer
		this.renderer.load(this.props.events)
	}

	private handlePlay = () => {
		if (this.renderer) {
			this.setState({
				...this.state,
				playing: true,
			})
			this.renderer.startPlaying(this.state.speed, this.handleStop)
		}
	}

	private handleStop = () => {
		if (this.renderer) {
			this.setState({
				...this.state,
				playing: false,
			})
			this.renderer.stopPlaying()
		}
	}

	private handleSpeedChange = e => {
		this.setState({
			...this.state,
			speed: e.target.value / 100,
		})
	}

	render() {
		return (
			<React.Fragment>
				<div style={{ paddingBottom: 4 }}>
					{this.state.playing ? (
						<button onClick={this.handleStop}>stop</button>
					) : (
						<button onClick={this.handlePlay}>play</button>
					)}

					<div style={{ width: 80, display: "inline-block" }}>
						speed: {this.state.speed}
					</div>
					<input
						type="range"
						min="0"
						max="300"
						value={this.state.speed * 100}
						onChange={this.handleSpeedChange}
					/>
				</div>

				<Sequencer onMount={this.handleMount} />
			</React.Fragment>
		)
	}
}
