# Piano Sketch Tool

The goal of this project is to create a tool for recording, learning, and sharing piano songs.

- [Check out the Live Demo](https://ccorcos.github.io/piano-sketch-tool)
- [Check out the Gallery](https://github.com/ccorcos/piano-sketch-tool/blob/master/GALLERY.md)

## To-Do

- Features
	- halt feature togglable -- wait for you to play all the notes before continuing.
	- trim the beginning of the song to one second of lead-in.
	- play the song aloud do you can hear it.

	- ui stuff
		- time elapsed
		- title
		- date of recording
		- indication if you hit the right note at the right time.

	- save notes to a file
	- load a file with notes

	- select and loop a section

- Bugs
	- history forward/back navigation

## Designs

- [Figma](https://www.figma.com/file/QfhKUMaUldqcE5I0DXtq3U/Piano-Sketch-Tool?node-id=0%3A1)

## Development

```sh
git clone git@github.com:ccorcos/typescript-boilerplate.git project
cd project
git remote remove origin
npm install
npm start
```

You can test out this program without connecting to a MIDI device by running the midi simulator

```sh
node src/midi-simulator.js
```
