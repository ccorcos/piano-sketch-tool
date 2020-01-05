const midi = require("midi")

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function playSong() {
	// Set up a new output.
	const output = new midi.Output()

	async function sendNote(midiNote, timeMs) {
		output.sendMessage([144, midiNote, 1])
		console.log("T", midiNote)
		await wait(timeMs)
		console.log("F", midiNote)
		output.sendMessage([128, midiNote, 1])
	}

	output.openVirtualPort("Midi Simulator")

	while (true) {
		const note = Math.floor(Math.random() * 60 + 21)
		await sendNote(note, 600)
		await wait(200)
	}
	// Close the port when done.
	output.closePort()
	input.closePort()
}

playSong()
