const express = require('express')
const app = express()
const server = require('http').createServer(app)
const { Server } = require('ws')
const pty = require('node-pty')

const terminals = {},
	logs = {}

app.use(express.static('public'))

const wss = new Server({ server })

wss.on('connection', (ws) => {
	let term
	ws.on('message', (msg) => {
		const data = JSON.parse(msg)
		if (data.type === 'create') {
			// Change here to use 'login' command
			term = pty.spawn('login', [], {
				name: 'xterm-256color',
				cols: data.cols,
				rows: data.rows,
			})
			console.log(`Created terminal with PID: ${term.pid}`)
			terminals[term.pid] = term
			logs[term.pid] = ''
			term.onData((data) => {
				try {
					ws.send(JSON.stringify({ type: 'data', data: data }))
				} catch (e) {
					// handle error
				}
			})
		} else if (data.type === 'input') {
			term.write(data.input)
		} else if (data.type === 'resize') {
			term.resize(data.cols, data.rows)
		}
	})

	ws.on('close', () => {
		if (term) {
			term.kill()
			console.log(`Closed terminal ${term.pid}`)
			// Clean up the terminal
			delete terminals[term.pid]
			delete logs[term.pid]
		}
	})
})

server.listen(3000, () => {
	console.log('Server started on http://localhost:3000')
})
