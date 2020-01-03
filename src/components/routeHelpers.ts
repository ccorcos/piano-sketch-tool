import * as url from "url"
import { MidiEvent } from "./Sequencer"
import { toString, fromString } from "./fileHelpers"

export function clearSongUrl() {
	const parsed = url.parse(location.href, true)
	delete parsed.search
	delete parsed.query
	const next = url.format(parsed)
	history.pushState({}, "", next)
}

export function getSongUrl(href: string) {
	const parsed = url.parse(href, true)
	if (parsed.query.song) {
		const events = fromString(decodeURIComponent(parsed.query.song as string))
		return events
	}
}

export function setSongUrl(song: Array<MidiEvent>) {
	const parsed = url.parse(location.href, true)
	delete parsed.search
	// console.log(toString(song))
	parsed.query.song = toString(song)
	const next = url.format(parsed)
	history.pushState({}, "", next)
}
