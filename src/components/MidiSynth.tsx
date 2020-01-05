import * as React from "react"
import * as Tone from "tone"
import * as _ from "lodash"
import { MidiEmitter } from "./MidiEmitter"

interface MidiSoundProps {
	midi: MidiEmitter
	label: string
}

interface MidiSoundState {
	on: boolean
}

const startTone = _.once(() => {
	Tone.start()
	return new Tone.PolySynth(10, Tone.Synth, {
		oscillator: { type: "sine" },
	}).toMaster()
})

export class MidiSynth extends React.PureComponent<
	MidiSoundProps,
	MidiSoundState
> {
	state: MidiSoundState = { on: false }

	synth: any

	private handleToggleSound = e => {
		if (this.state.on) {
			this.setState({ on: false })
			this.props.midi.removeListener(this.handleMidiNote)
		} else {
			this.setState({ on: true })
			this.synth = startTone()
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
				<span>{this.props.label}</span>
				<button style={{ width: 60 }} onClick={this.handleToggleSound}>
					{this.state.on ? "Turn Off" : "Turn On"}
				</button>
			</div>
		)
	}
}
