const fontSize = 16;
const term = new Terminal({
	fontSize: fontSize,
	fontFamily: 'monospace',
	letterSpacing: 0,
});
const socket = new WebSocket('wss://terminal.mitchellgjohnson.com');
let pid;

socket.onopen = () => {
	const { cols, rows } = calculateTerminalSize()

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
		const { cols, rows } = calculateTerminalSize()
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

function calculateTerminalSize() {
	const container = document.getElementById('textContainer');
	let rows = 0;
	let cols = 0;

	// Add rows until the container is filled vertically
	while (container.scrollHeight <= container.clientHeight && rows < 10000) {
		const row = document.createElement('div');
		row.textContent = 'X';
		container.appendChild(row);
		rows++;
	}

	// Add characters to the first row until the container is filled horizontally
	const firstRow = container.firstChild;
	while (container.scrollWidth <= container.clientWidth && cols < 10000) {
		firstRow.textContent += 'X';
		cols++;
	}

	rows--;
	cols--;
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
