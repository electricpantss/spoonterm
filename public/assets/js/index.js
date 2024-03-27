const fontSize = 16;
const term = new Terminal({
	fontSize: fontSize,
	fontFamily: 'monospace',
	letterSpacing: 0,
});
const socket = new WebSocket('wss://terminal.mitchellgjohnson.com');
let pid;

socket.onopen = () => {
	const { cols, rows } = fillTest(term)

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

function fillTest() {
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

	return { cols, rows };
}

function calculateTerminalSize(terminal) {
	// Get device pixel ratio
	const devicePixelRatio = window.devicePixelRatio;

	// Get terminal width and height
	const terminalDiv = document.getElementById('terminal');
	const terminalWidth = terminalDiv.offsetWidth;
	const terminalHeight = terminalDiv.offsetHeight;

    // Create a temporary element to measure the character dimensions
    const tempElement = document.createElement('p');
    tempElement.style.fontFamily = 'monospace';
    tempElement.style.fontSize = fontSize;
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.textContent = 'W'; // Use a wide character for measurement
    document.body.appendChild(tempElement);

    // Calculate the character dimensions
    const charWidth = tempElement.offsetWidth * devicePixelRatio;
    const charHeight = tempElement.offsetHeight * devicePixelRatio;

    // Remove the temporary element
    document.body.removeChild(tempElement);

    // Calculate the number of columns and rows based on the character dimensions
    const cols = Math.floor(document.body.clientWidth / charWidth) - 1;
    const rows = Math.floor(document.body.clientHeight / charHeight) + 1;

    console.log(`Character width: ${charWidth}, Character height: ${charHeight}`);
    console.log(`Window width: ${window.innerWidth}, Window height: ${window.innerHeight}`);
    console.log(`Terminal width: ${terminalWidth}, Terminal height: ${terminalHeight}`);
    console.log(`Document Body width: ${document.body.clientWidth}, Document Body height: ${document.body.clientHeight}`);
    console.log(`Device Pixel Ratio: ${devicePixelRatio}`);
    console.log(`Columns: ${cols}, Rows: ${rows}`);

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
