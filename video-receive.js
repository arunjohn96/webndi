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
app.get("/ndi_return/client/receiver", function(req, res) {
  res.sendFile(__dirname + "/public/returnCanvas.html");
});

const frameData = {
  data: null
}
app.get('/server-sent-events', function(req, res) {
  // emitter.on('receive', (data) => {
  //   console.log("return frame:::", id);
  //   videoFrameIs = new Uint8ClampedArray(data);
  //   console.log(videoFrameIs.length);
  //   // some(data)
  //   console.log("recieve::::::::::::");
  // });

  var number = 0;
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  var interval = setInterval(function() {
    data = "Real-Time Update " + number;
    console.log("SENT: " + data);
    res.write("data: " + data + "\n\n")
    number++;
  }, 1000);

  // close
  res.on('close', () => {
    clearInterval(interval);
    res.end();
  });
})

ndi = addon.ndi;
const port = 7001;

const videoProperties = {
  id: 'channelName-720p',
  type: 'video',
  channelName: 'channelName-720p',
  channelSearchMaxWaitTime: '60',
  command: 'stop'
};

const emitter = new events.EventEmitter();
// Create Event Target Group at Client Level
//  Listen to events emitted from Server

var videoFrameIs;
var ndiSocket = false;

io.sockets.on("error", e => console.log(e));


io.sockets.on("connection", socket => {
  ndiSocket = socket;
  socket.emit("ready")
  socket.on('ping', () => {
    console.log('PING::::::::::');
    // socket.to(socket.id).emit('pong', socket.id)
    // socket.emit('pong', socket.id)
  })
  socket.on("message", (data) => {
    console.log(data);
    socket.emit("message", 'connected to ndiReturnSocket:::::::::::')
  })
  socket.on("hello", () => {
    socket.emit("hello", socket.id)
  })

  socket.on("ready", (id) => {
    console.log("::::::::::::::::::::::::::::::", id);
    socket.to(id).emit('message', 'hai!!!')
    emitter.on('receive', (data) => {
      console.log("return frame:::", id);
      videoFrameIs = new Uint8ClampedArray(data);
      console.log(videoFrameIs.length);
      // some(data)
      socket.emit('message', "HAI!!")
      socket.emit('rgba_receiver', videoFrameIs.buffer)

      console.log("recieve::::::::::::");
    });
    socket.emit('message', "ready received on server :::")

    ndi('create-receive-video-channel', videoProperties);
    console.log("CREATE_RECEIVE_VIDEO_CHANNEL::::::::::::::::");
    var i = 0;
    setInterval(() => {
      ndi('receive-video', videoProperties, emitter.emit.bind(emitter))
    },1000)
    console.log("CREATE_RECEIVE_VIDEO_CHANNEL2::::::::::::::::");


  });

  socket.on("disconnect", () => {
    ndiSocket = false;
  });

})


//
// 1. Global variable as object
// 2. Events Client Library
// 3. Socket SetInterval
// 4. Server Canvas Processing
server.listen(port, () => console.log(`Server is running on port ${port}`));
