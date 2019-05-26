import WebSocket from 'ws'

PORT = process.env.PORT || 8080

const wss = new WebSocket.Server({port: PORT});

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
  });
});
