const term = new Terminal();
const socket = new WebSocket('ws://0.0.0.0:3000');
let pid;

socket.onopen = () => {
  term.open(document.getElementById('terminal'));

  term.onData(data => {
    socket.send(JSON.stringify({ type: 'input', input: data }));
  });

  term.onResize(({ cols, rows }) => {
    socket.send(JSON.stringify({ type: 'resize', cols: cols, rows: rows }));
  });
  
  socket.send(JSON.stringify({ type: 'create', cols: term.cols, rows: term.rows }));

  const { cols, rows } = calculateTerminalSize(term);
  socket.send(JSON.stringify({ type: 'resize', cols: term.cols, rows: term.rows }));
  term.resize(cols, rows);
};

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === 'data') {
    term.write(msg.data);
  }
};

window.addEventListener('resize', debounce(() => {
  const { cols, rows } = calculateTerminalSize(term);
  socket.send(JSON.stringify({ type: 'resize', cols, rows }));
  term.resize(cols, rows);
}, 250));

function calculateTerminalSize(terminal) {
  const terminalContainer = terminal.element.parentElement;
  const style = window.getComputedStyle(terminalContainer);
  const terminalWidth = parseInt(style.getPropertyValue('width'));
  const terminalHeight = parseInt(style.getPropertyValue('height'));
  // Assuming 9x15 as the size of each character; adjust as per your styling
  const charWidth = 9;
  const charHeight = 16;
  const cols = Math.floor(terminalWidth / charWidth);
  const rows = Math.floor(terminalHeight / charHeight);
  return { cols, rows };
}

function debounce(func, timeout = 300){
  let timer;
  return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}
