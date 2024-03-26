const term = new Terminal()
const socket = new WebSocket('ws://10.0.0.243:3000')
let pid

socket.onopen = () => {
	term.open(document.getElementById('terminal'))

	term.onData((data) => {
		socket.send(JSON.stringify({ type: 'input', input: data }))
	})

	term.onResize(({ cols, rows }) => {
		socket.send(JSON.stringify({ type: 'resize', cols: cols, rows: rows }))
	})

	socket.send(
		JSON.stringify({ type: 'create', cols: term.cols, rows: term.rows })
	)

	const { cols, rows } = calculateTerminalSize(term)
	socket.send(
		JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows })
	)
	term.resize(cols, rows)
}

socket.onmessage = (event) => {
	const msg = JSON.parse(event.data)
	if (msg.type === 'data') {
		term.write(msg.data)
	}
}

window.addEventListener(
	'resize',
	debounce(() => {
		const { cols, rows } = calculateTerminalSize(term)
		socket.send(JSON.stringify({ type: 'resize', cols, rows }))
		term.resize(cols, rows)
	}, 250)
)

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function () {
		navigator.serviceWorker.register('/assets/js/service-worker.js').then(
			function (registration) {
				// Registration was successful
				console.log(
					'ServiceWorker registration successful with scope: ',
					registration.scope
				)
			},
			function (err) {
				// registration failed :(
				console.log('ServiceWorker registration failed: ', err)
			}
		)
	})
}

function calculateTerminalSize(terminal) {
    const terminalContainer = terminal.element.parentElement;
    const style = window.getComputedStyle(terminalContainer);

    // Create a temporary span to measure the character size
    const span = document.createElement('span');
    span.style.font = style.font; // Set the font style to match the terminal's font
    span.textContent = 'W'; // Use a wide character to measure the width
    document.body.appendChild(span); // Append the span to the body to measure its dimensions

    // Get the character width and height
    const charWidth = span.offsetWidth;
    const charHeight = span.offsetHeight;

    // Remove the temporary span
    document.body.removeChild(span);

    // Calculate the number of columns and rows
    const terminalWidth = parseInt(style.getPropertyValue('width'));
    const terminalHeight = parseInt(style.getPropertyValue('height'));
    const cols = Math.floor(terminalWidth / charWidth);
    const rows = Math.floor(terminalHeight / charHeight) - 1;

    return { cols, rows };
}

function debounce(func, timeout = 300) {
	let timer
	return (...args) => {
		clearTimeout(timer)
		timer = setTimeout(() => {
			func.apply(this, args)
		}, timeout)
	}
}
