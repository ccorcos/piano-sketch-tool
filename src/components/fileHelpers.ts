import * as _ from "lodash"
import { MidiEvent } from "./Sequencer"

const radix = 36
export function toString(notes: Array<MidiEvent>) {
	return notes
		.map(note => {
			return [
				note.keyOn ? "T" : "F",
				note.midiNote
					.toString(radix)
					.slice(0, 2)
					.padStart(2, "0"),
				note.timeMs
					.toString(radix)
					.slice(0, 4)
					.padStart(4, "0"), // 27 minutes max.
			].join("")
		})
		.join("")
}

export function fromString(str: string) {
	const notes = _.chunk(str, 7).map(chunk => {
		const note: MidiEvent = {
			keyOn: chunk[0] === "T",
			midiNote: parseInt(chunk.slice(1, 3).join(""), radix),
			timeMs: parseInt(chunk.slice(3, 7).join(""), radix),
		}
		return note
	})
	return notes
}
