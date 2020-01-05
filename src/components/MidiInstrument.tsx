import * as React from "react"

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

type MidiNodeListener = (on: boolean, midiNote: number) => void

export class MidiEmitter {
	listeners: Set<MidiNodeListener> = new Set()
	addListener(fn: MidiNodeListener) {
		this.listeners.add(fn)
	}
	removeListener(fn: MidiNodeListener) {
		this.listeners.delete(fn)
	}
	keys: Set<number> = new Set()
	emit(keyOn: boolean, midiNote: number) {
		for (const listener of this.listeners.values()) {
			listener(keyOn, midiNote)
		}
		if (keyOn) {
			this.keys.add(midiNote)
		} else {
			this.keys.delete(midiNote)
		}
	}
	clear() {
		const keys = Array.from(this.keys.values())
		for (const key of keys) {
			this.emit(false, key)
		}
	}
}

export class ComputerMidiInstrument {
	constructor(private emitter: MidiEmitter) {}

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
				this.emitter.emit(true, midiNote)
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
				this.emitter.emit(false, midiNote)
			}
		}
	}
}

interface MidiSelectorProps {
	midi: MidiEmitter
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
	constructor(props) {
		super(props)
		this.keyboard = new ComputerMidiInstrument(props.midi)
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
		this.props.midi.clear()
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
			console.log("midi", name, this.state.selector)
			const [command, note] = msg.data
			if (command === 144) {
				// console.log("T", note)
				this.props.midi.emit(true, note)
			} else if (command === 128) {
				// console.log("F", note)
				this.props.midi.emit(false, note)
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
