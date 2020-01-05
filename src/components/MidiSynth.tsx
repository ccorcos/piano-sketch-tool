import * as React from "react"
import * as Tone from "tone"
import * as _ from "lodash"
import { MidiEmitter } from "./MidiInstrument"

interface MidiSoundProps {
	midi: MidiEmitter
}

interface MidiSoundState {
	on: boolean
}

export class MidiSynth extends React.PureComponent<
	MidiSoundProps,
	MidiSoundState
> {
	state: MidiSoundState = { on: false }

	synth: any

	private startTone = _.once(() => {
		Tone.start()
		this.synth = new Tone.PolySynth(10, Tone.Synth, {
			oscillator: { type: "sine" },
		}).toMaster()
	})

	private handleToggleSound = e => {
		if (this.state.on) {
			this.setState({ on: false })
			this.props.midi.removeListener(this.handleMidiNote)
		} else {
			this.setState({ on: true })
			this.startTone()
			this.props.midi.addListener(this.handleMidiNote)
		}
	}

	private handleMidiNote = (keyOn: boolean, midiNote: number) => {
		if (this.synth) {
			if (keyOn) {
				this.synth.triggerAttack(Tone.Midi(midiNote).toNote())
			} else {
				this.synth.triggerRelease(Tone.Midi(midiNote).toNote())
			}
		}
	}

	render() {
		return (
			<div style={{ marginLeft: 8 }}>
				<span>Instrument Sound: </span>
				<button onClick={this.handleToggleSound}>
					{this.state.on ? "Turn Off" : "Turn On"}
				</button>
			</div>
		)
	}
}
