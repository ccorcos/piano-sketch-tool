import * as React from "react"

interface KeyboardShorcutsProps {
	keydown: (key: string) => boolean | void | undefined
}

export class KeyboardShorcuts extends React.PureComponent<
	KeyboardShorcutsProps
> {
	componentWillMount() {
		window.addEventListener("keydown", this.handleKeyDown)
	}

	componentWillUnmount() {
		window.removeEventListener("keydown", this.handleKeyDown)
	}

	private handleKeyDown = e => {
		if (this.props.keydown(e.key)) {
			e.preventDefault()
		}
	}

	render() {
		return <span />
	}
}
