# Welcome to SpoonTerm!

Lightweight, simple, easy-to-use web based delivery of any terminal with xterm.js

# Setup Instructions

Update WebSocket Connection URL

- In 'public/assets/js/index.js'
  **const socket = new WebSocket(YOUR URL HERE)**

NOTE:

- URL must follow this format:
  - 'wss://localhost:3000' For a HTTPS connection / Nginx Reverse Proxy
  - 'ws://localhost:3000' For a HTTP connection / local connection

# Starting

- npm i
- node server.js

# Systemd Service

- in '/etc/systemd/system/spoonterm.service'

```shell
[Unit]
Description=SpoonTerm
After=network.target

[Service]
ExecStart=/usr/bin/node server.js
Restart=always
User=root
Group=root
WorkingDirectory=/path/to/your/app

[Install]
WantedBy=multi-user.target
```

- Start the service

```shell
sudo systemctl daemon-reload
sudo systemctl enable --now spoonterm.service
```
