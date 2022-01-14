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
  path: '/ndi_return/client/socket.io'
});
const addon = require('bindings')('ndi');
app.use('/static', express.static('public'))
ndi = addon.ndi;
const port = 7001;
var receiverIds = []
const videoProperties = {
  id: 'x003',
  type: 'video',
  channelName: 'test-v1',
  channelSearchMaxWaitTime: '25',
  command: 'stop',
  pollInterval: '0',
  bandWidth: 'low'
};

const emitter = new events.EventEmitter();

app.use(express.json())
app.post('/ndi_return/client/receiver', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  console.log(req.body);
  let channelName = req.body.channelName
  console.log(channelName);
  videoProperties.channelName = channelName
  videoProperties.id = channelName + '-return-id'
  initializeReturnFeed(videoProperties)
    .then(() => {
      res.send({
        message: 'success',
        data: req.body
      })
    })
    .catch((err) => {
      res.send({
        message: 'failed',
        error: err
      })
    })
})
app.use('/static', express.static('public'))
app.get("/ndi_return/client/receiver", function(req, res) {
  res.sendFile(__dirname + "/public/returnCanvas.html");
});

function message(msg) {
  console.log(msg)
}

function capture(data) {
  var videoFrameIs = new Uint8Array(data);
  var rgbaFrame = new Uint8Array(videoFrameIs.byteLength)
  rgbaFrame.set(videoFrameIs)
  emitter.emit('rgba', rgbaFrame)
}

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

    socket.emit('message', "ready received on server :::")

    // initializeReturnFeed(videoProperties);
    emitter.on('rgba', (data) => {
      socket.emit('rgba_receiver', data.buffer)
    });

  });

  socket.on("disconnect", () => {
    ndiSocket = false;
  });

})

async function initializeReturnFeed(videoProperties) {
  ndi('create-receive-video-channel', videoProperties);
  receiverIds.push(videoProperties.id)
  console.log("CREATE_RECEIVE_VIDEO_CHANNEL::::::::::::::::");
  ndi('receive-video', videoProperties, message, capture);
}

server.listen(port, () => console.log(`Server is running on port ${port}`));


/*
ndi('receive-video', videoProperties, message, emitter.emit.bind(emitter)) ;
*/
