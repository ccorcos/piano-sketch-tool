# Piano Sketch Tool [Demo](https://ccorcos.github.io/piano-sketch-tool)

The goal of this project is to create a tool for recording piano ideas as well as learning how to play piano songs. It is designed be easily shared with a url.

## Features

- play back notes with the same timing.
	- halt feature togglable -- wait for you to play all the notes before continuing.
- ui stuff
	- time elapsed
	- edit title
	- topbar actions
	- date of recording
	- piano guides in the ui.
	- indication if you hit the right note at the right time.

- save notes to a file
- load a file with notes

### Later

- select and loop a section

## Refactor

- Can we model the entire UI as a mutable state machine?

## Bugs

- history forward/back navigation

## Design

- [Figma](https://www.figma.com/file/QfhKUMaUldqcE5I0DXtq3U/Piano-Sketch-Tool?node-id=0%3A1)

## Getting Started

```sh
git clone git@github.com:ccorcos/typescript-boilerplate.git project
cd project
git remote remove origin
npm install
npm start
```
