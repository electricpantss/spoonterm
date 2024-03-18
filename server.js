const express = require('express');
const Terminal = require('@xterm/xterm');
const app = express();

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`DIRNAME ${__dirname}`);
});
