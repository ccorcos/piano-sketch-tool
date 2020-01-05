import * as React from "react"
import { MidiEmitter } from "./MidiEmitter"

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

export class ComputerMidiInstrument {
	constructor(private midiInstrument: MidiEmitter) {}

	start() {
		window.addEventListener("keydown", this.handleKeyDown)
		window.addEventListener("keyup", this.handleKeyUp)
	}

	stop() {
		window.removeEventListener("keydown", this.handleKeyDown)
		window.removeEventListener("keyup", this.handleKeyUp)
	}

	keys: Set<number> = new Set()

	private handleKeyDown = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			// event.preventDefault()
			// event.stopPropagation()
			const midiNote = keyMap[event.key] + 60
			if (!this.keys.has(midiNote)) {
				this.keys.add(midiNote)
				this.midiInstrument.emit(true, midiNote)
			}
		}
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			// event.preventDefault()
			// event.stopPropagation()
			const midiNote = keyMap[event.key] + 60
			if (this.keys.has(midiNote)) {
				this.keys.delete(midiNote)
				this.midiInstrument.emit(false, midiNote)
			}
		}
	}
}

interface MidiSelectorProps {
	midiInstrument: MidiEmitter
}

type MidiInput = {
	name: string
	onmidimessage: ((msg: { data: Array<number> }) => void) | undefined
}

interface MidiSelectorState {
	selector: string
	inputs: Array<MidiInput>
}

export class MidiSelector extends React.PureComponent<
	MidiSelectorProps,
	MidiSelectorState
> {
	state: MidiSelectorState = {
		selector: "computer",
		inputs: [],
	}

	keyboard: ComputerMidiInstrument
	constructor(props: MidiSelectorProps) {
		super(props)
		this.keyboard = new ComputerMidiInstrument(props.midiInstrument)
		this.keyboard.start()
		this.initializeMidi()
	}

	private initializeMidi() {
		// Set initial.
		this.getMidiInputs().then(inputs => {
			if (inputs && inputs.length !== 0 && this.state.selector === "computer") {
				this.setMidiInput(inputs[0].name)
			}
		})
	}

	private setMidiInput(name: string) {
		this.props.midiInstrument.clear()
		if (name === "refresh") {
			this.initializeMidi()
			return
		}
		if (name === this.state.selector) {
			return
		}
		// Unlisten
		if (this.state.selector === "computer") {
			this.keyboard.stop()
		}
		this.setState({ ...this.state, selector: name })
		if (name === "computer") {
			this.keyboard.start()
		}
	}

	private handleChangeSelector = e => {
		this.setMidiInput(e.target.value)
	}

	private handleMidiMessage = (name: string, msg) => {
		if (this.state.selector === name) {
			const [command, note] = msg.data
			if (command === 144) {
				this.props.midiInstrument.emit(true, note)
			} else if (command === 128) {
				this.props.midiInstrument.emit(false, note)
			}
		}
	}

	private async getMidiInputs() {
		const n = navigator as any
		if (!n.requestMIDIAccess) {
			alert("No Midi. Try Chrome.")
			return
		}
		const m = await n.requestMIDIAccess()
		const inputs = Array.from(m.inputs.values()) as Array<MidiInput>
		for (const input of inputs) {
			const inputName = input.name
			input.onmidimessage = msg => this.handleMidiMessage(inputName, msg)
		}
		this.setState({
			...this.state,
			inputs: inputs,
		})
		return inputs
	}

	render() {
		return (
			<div>
				<span style={{ marginRight: 4 }}>Midi Input:</span>
				<select
					id="lang"
					onChange={this.handleChangeSelector}
					value={this.state.selector}
				>
					<option value="computer">Computer Keyboard</option>
					{this.state.inputs.map(input => (
						<option key={input.name} value={input.name}>
							{input.name}
						</option>
					))}
					<option value="refresh">[refresh]</option>
				</select>
			</div>
		)
	}
}
