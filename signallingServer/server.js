// const express = require('express')
// const app = express()
// // const cors = require('cors')
// // app.use(cors())
// const server = require('http').Server(app)
// const io = require('socket.io')(server)
// const { ExpressPeerServer } = require('peer');
// const peerServer = ExpressPeerServer(server, {
//   debug: true
// });
// const { v4: uuidV4 } = require('uuid')

// app.use('/peerjs', peerServer);

// app.set('view engine', 'ejs')
// app.use(express.static('public'))

// app.get('/', (req, res) => {
//   res.redirect(`/${uuidV4()}`)
// })

// app.get('/:room', (req, res) => {
//   res.render('room', { roomId: req.params.room })
// })

// io.on('connection', socket => {
//   socket.on('join-room', (roomId, userId) => {
//     console.log(roomId);
//     socket.join(roomId)
//     socket.to(roomId).broadcast.emit('user-connected', userId);
//     // messages
//     socket.on('message', (message) => {
//       //send message to the same room
//       io.to(roomId).emit('createMessage', message)
//   }); 

//     socket.on('disconnect', () => {
//       socket.to(roomId).broadcast.emit('user-disconnected', userId)
//     })
//   })
// })

// server.listen(process.env.PORT||3030)
const WebSocket = require('ws');

// Create a WebSocket server
const server = new WebSocket.Server({ port: 8080 });

// Store a reference to the active WebSocket connection
let connection;

// Handle incoming WebSocket connections
server.on('connection', function(ws) {
  console.log('WebSocket connection established');

  // Store the WebSocket connection
  connection = ws;

  // Handle incoming messages
  ws.on('message', function(message) {
    console.log('Received message:', message);

    // Forward the message to the other peer
    if (connection && connection !== ws) {
      connection.send(message);
    }
  });

  // Handle the WebSocket connection closing
  ws.on('close', function() {
    console.log('WebSocket connection closed');
    connection = null;
  });
});

console.log('Signaling server listening on port 8080');
