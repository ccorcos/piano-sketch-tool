const midi = require("midi")

function wait(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function playSong() {
	// Set up a new output.
	const output = new midi.Output()

	function sendNote(midiNote, timeMs) {
		output.sendMessage([144, midiNote, 1])
		console.log("T", midiNote)
		setTimeout(() => {
			output.sendMessage([128, midiNote, 1])
			console.log("F", midiNote)
		}, timeMs)
	}

	output.openVirtualPort("Roland Patch")

	while (true) {
		sendNote(40, 600)
		await wait(600 + 200)
		sendNote(45, 600)
		await wait(600 + 200)
	}
	// Close the port when done.
	output.closePort()
	input.closePort()
}

playSong()
