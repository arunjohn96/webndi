const events = require('events')
const express = require("express");
const process = require("process");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs')
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
const addon = require('bindings')('ndi');
app.use('/static', express.static('public'))
ndi = addon.ndi;
const port = process.env.PORT || 7001;
server.listen(port, () => console.log(`Server is running on port ${port}`));

const videoProperties = {
  id: 'x003',
  type: 'video',
  channelName: 'testv',
  channelSearchMaxWaitTime: '60',
  command: 'stop'
};

const emitter = new events.EventEmitter();
var videoFrameIs ;
var ndiSocket;

emitter.on('receive', (data) => {
  videoFrameIs = new Uint8Array(data);
  if (typeof(ndiSocket) ==='undefined'){
    ndiSocket.broadcast.emit()
  }
});

io.sockets.on("error", e => console.log(e));

io.sockets.on("connection", socket => {
  ndiSocket = socket;
  socket.on('get_image', (room)=>{
    socket.join(room) //NDIReceiver
  })

})



ndi('create-receive-video-channel', videoProperties);
ndi('receive-video', videoProperties, emitter.emit.bind(emitter));
//
// 1. Global variable as object
// 2. Events Client Library
// 3. Socket SetInterval
// 4. Server Canvas Processing
