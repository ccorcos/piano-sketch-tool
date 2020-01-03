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

export interface Emitter<T extends Array<any>> {
	addListener(fn: (...args: T) => void): void
	removeListener(fn: (...args: T) => void): void
}

export interface MidiSource extends Emitter<[boolean, number]> {}

export class ComputerMidiSource implements MidiSource {
	listeners: Set<MidiNodeListener> = new Set()
	addListener(fn: MidiNodeListener) {
		this.listeners.add(fn)
	}
	removeListener(fn: MidiNodeListener) {
		this.listeners.delete(fn)
	}

	start() {
		window.addEventListener("keydown", this.handleKeyDown)
		window.addEventListener("keyup", this.handleKeyUp)
	}

	stop() {
		window.removeEventListener("keydown", this.handleKeyDown)
		window.removeEventListener("keyup", this.handleKeyUp)
	}

	private handleKeyDown = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			const midiNote = keyMap[event.key]
			for (const listener of this.listeners.values()) {
				listener(true, midiNote)
			}
		}
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		if (event.key in keyMap) {
			const midiNote = keyMap[event.key]
			for (const listener of this.listeners.values()) {
				listener(false, midiNote)
			}
		}
	}
}

export class WebMidiSource implements MidiSource {
	listeners: Set<MidiNodeListener> = new Set()
	addListener(fn: MidiNodeListener) {
		this.listeners.add(fn)
	}
	removeListener(fn: MidiNodeListener) {
		this.listeners.delete(fn)
	}

	m: any
	async start() {
		const n = navigator as any
		if (!n.requestMIDIAccess) {
			alert("No Midi. Try Chrome.")
			return
		}
		this.m = await n.requestMIDIAccess()

		// console.log(this.m)
		for (var input of this.m.inputs.values()) {
			input.onmidimessage = msg => {
				const [command, note] = msg.data
				if (command === 144) {
					// console.log("T", note)
					for (const listener of this.listeners.values()) {
						listener(true, note)
					}
				} else if (command === 128) {
					// console.log("F", note)
					for (const listener of this.listeners.values()) {
						listener(false, note)
					}
				}
			}
		}
	}

	stop() {}
}
