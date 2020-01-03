import { MidiEvent } from "./Sequencer"

export function toString(notes: Array<MidiEvent>) {
	return notes
		.map(note => {
			return [note.keyOn ? "T" : "F", note.midiNote, note.timeMs].join(",")
		})
		.join("\n")
}

export function fromString(str: string) {
	return str.split("\n").map(line => {
		const [a, b, c] = line.split(",")
		const note: MidiEvent = {
			keyOn: a === "T",
			midiNote: parseInt(b),
			timeMs: parseInt(c),
		}
		return note
	})
}
