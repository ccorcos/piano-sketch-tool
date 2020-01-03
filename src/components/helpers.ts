export const pianoSize = 72
export const sequencerHeight = 400
export const pixelsPerMillisecond = sequencerHeight / 2500

export const whiteNoteWidth = 20
export const whiteNoteHeight = 80
export const blackNoteHeight = whiteNoteHeight * 0.6
export const blackNoteWidth = whiteNoteWidth * 0.6

export const whiteNoteColor = "#7B9EFA"
export const blackNoteColor = "#5C75B4"

export function getXPosition(midiNote: number) {
	const offset = Math.floor(midiNote / 12) * whiteNoteWidth * 7

	const note = midiNote % 12
	switch (note) {
		// White Notes
		case 0: {
			const xPosition = offset + 0 * whiteNoteWidth
			return xPosition
		}
		case 2: {
			const xPosition = offset + 1 * whiteNoteWidth
			return xPosition
		}
		case 4: {
			const xPosition = offset + 2 * whiteNoteWidth
			return xPosition
		}
		case 5: {
			const xPosition = offset + 3 * whiteNoteWidth
			return xPosition
		}
		case 7: {
			const xPosition = offset + 4 * whiteNoteWidth
			return xPosition
		}
		case 9: {
			const xPosition = offset + 5 * whiteNoteWidth
			return xPosition
		}
		case 11: {
			const xPosition = offset + 6 * whiteNoteWidth
			return xPosition
		}
		// Black Notes
		case 1: {
			const xPosition = offset + whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 3: {
			const xPosition = offset + 2 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 6: {
			const xPosition = offset + 4 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 8: {
			const xPosition = offset + 5 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
		case 10: {
			const xPosition = offset + 6 * whiteNoteWidth - blackNoteWidth / 2
			return xPosition
		}
	}
	throw new Error("Unknown note")
}

export function isBlackNote(midiNote: number) {
	const note = midiNote % 12
	switch (note) {
		// White Notes
		case 0:
		case 2:
		case 4:
		case 5:
		case 7:
		case 9:
		case 11: {
			return false
		}
		// Black Note
		default: {
			return true
		}
	}
}

export function getPianoWidth(midiNote: number) {
	const position = getXPosition(midiNote)
	return isBlackNote(midiNote)
		? position + blackNoteWidth
		: position + whiteNoteWidth
}
