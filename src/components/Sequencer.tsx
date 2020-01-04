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
	pianoWidth,
	midiRange,
} from "./helpers"
import { MidiSource } from "./MidiSource"
import { setSongUrl } from "./routeHelpers"

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

type SequencerRecordingState = {
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

type SequencerState = {
	rootElm: HTMLDivElement
	scrollerElm: HTMLDivElement
	noteGuides: Record<number, HTMLDivElement>
}

type RecordingState = {
	recording: boolean
	sequencer: SequencerState
	completedNotes: Array<CompletedNote>
	incompleteNotes: Array<IncompletedNote>
	events: Array<MidiEvent>
}

type PlayerState = {
	playing: boolean
	sequencer: SequencerState
}

function initSequencer(div: HTMLDivElement): SequencerState {
	div.style.position = "absolute"
	div.style.top = "0px"
	div.style.left = "0px"
	div.style.right = "0px"
	div.style.height = "0px"

	const noteGuides: Record<number, HTMLDivElement> = {}

	for (let i = midiRange.start; i < midiRange.end; i++) {
		// Create the light gray guide lines
		if (i % 12 === 0 || i % 12 === 5) {
			const makeGuide = () => {
				const elm = document.createElement("div")
				elm.style.position = "absolute"
				elm.style.top = "0px"
				elm.style.bottom = "0px"
				elm.style.width = "2px"
				elm.style.background = "#d0d0d0"
				elm.style.left = `${getXPosition(i) - 2}px`
				return elm
			}
			div.appendChild(makeGuide())
			div.parentElement!.appendChild(makeGuide())
		}

		// Create note highlight guides
		const makeNoteGuide = () => {
			const elm = document.createElement("div")
			elm.style.position = "absolute"
			elm.style.top = "0px"
			elm.style.bottom = "0px"
			elm.style.width = isBlackNote(i)
				? `${blackNoteWidth}px`
				: `${whiteNoteWidth}px`
			elm.style.background = isBlackNote(i) ? blackNoteColor : whiteNoteColor
			elm.style.left = `${getXPosition(i)}px`
			elm.style.opacity = 0 as any
			noteGuides[i] = elm
			return elm
		}

		div.appendChild(makeNoteGuide())
	}

	const scrollerElm = div.parentElement! as HTMLDivElement

	return { noteGuides, rootElm: div, scrollerElm }
}

function initRecording(div: HTMLDivElement): RecordingState {
	return {
		sequencer: initSequencer(div),
		recording: false,
		completedNotes: [],
		incompleteNotes: [],
		events: [],
	}
}

function initPlayer(div: HTMLDivElement): PlayerState {
	return {
		playing: false,
		sequencer: initSequencer(div),
		// completedNotes: [],
		// incompleteNotes: [],
		// events: [],
	}
}

function startRecording() {}
function stopRecording() {}

function startPlaying() {}
function stopPlaying() {}
function restartPlayer() {}

// TODO: need to rethink the Sequencer abstraction.
// if (this.playMode) {
// 	if (keyOn) {
// 		this.guides[midiNote].style.opacity = 0.3 as any
// 		console.log(this.guides[midiNote], "on")
// 	} else {
// 		this.guides[midiNote].style.opacity = 0.0 as any

// 		console.log(this.guides[midiNote], "off")
// 	}
// }

export class SequencerRenderer {
	state: SequencerRecordingState

	constructor(div: HTMLDivElement) {
		initSequencer(div)
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

		setSongUrl(events)
	}

	resetScroll() {
		this.state.root.parentElement!.scrollTop = this.state.root.parentElement!.scrollHeight
	}

	playing = false
	speed = 1
	startPlaying(finished?: () => void) {
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
				pixelsPerMillisecond * dt * this.speed
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
						width: pianoWidth,
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
	source: MidiSource
	render: (props: {
		recording: boolean
		start: () => void
		stop: () => Array<MidiEvent>
		sequencer: JSX.Element
	}) => React.ReactNode
}

interface SequenceRecorderState {
	recording: boolean
}

export class SequenceRecorder extends React.PureComponent<
	SequenceRecorderProps,
	SequenceRecorderState
> {
	state: SequenceRecorderState = { recording: false }

	private renderer: SequencerRenderer | undefined

	private handleMount = (renderer: SequencerRenderer) => {
		this.renderer = renderer
	}

	private handleStart = () => {
		this.setState({ recording: true })
		if (this.renderer) {
			this.props.source.addListener(this.handleMidiNote)
			this.renderer.startRecording(Date.now())
		}
	}

	private handleStop = () => {
		this.setState({ recording: false })
		this.props.source.removeListener(this.handleMidiNote)
		if (this.renderer) {
			this.renderer.stopRecording()
			return this.renderer.state.events
		}
		return []
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
		return this.props.render({
			recording: this.state.recording,
			start: this.handleStart,
			stop: this.handleStop,
			sequencer: <Sequencer onMount={this.handleMount} />,
		})
	}
}

interface SequencePlayerProps {
	events: Array<MidiEvent>
	render: (props: {
		playing: boolean
		play: () => void
		pause: () => void
		restart: () => void
		speed: number
		setSpeed: (speed: number) => void
		sequencer: JSX.Element
	}) => React.ReactNode
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
			this.renderer.speed = this.state.speed
			this.renderer.startPlaying(this.handleStop)
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

	private handleRestart = () => {
		if (this.renderer) {
			this.renderer.resetScroll()
		}
	}

	private handleSpeedChange = (s: number) => {
		const speed = Math.min(3, Math.max(0, s))
		this.setState({
			...this.state,
			speed,
		})
		if (this.renderer) {
			this.renderer.speed = this.state.speed
		}
	}

	render() {
		return this.props.render({
			playing: this.state.playing,
			play: this.handlePlay,
			pause: this.handleStop,
			restart: this.handleRestart,
			speed: this.state.speed,
			setSpeed: this.handleSpeedChange,
			sequencer: <Sequencer onMount={this.handleMount} />,
		})
	}
}
