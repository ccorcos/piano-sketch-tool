import * as React from "react"

interface KeyboardShorcutsProps {
	keydown: (key: string) => void
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
		this.props.keydown(e.key)
	}

	render() {
		return <span />
	}
}
