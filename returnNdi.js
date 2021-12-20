const express = require("express");
const events = require('events')
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
app.use('/static', express.static('public'))
const addon = require('bindings')('ndi');
ndi = addon.ndi;
var ndiSocket;
var videoProperties = {
  id: 'v001',
  type: 'video',
  channelName: 'testv',
  xres: '960',
  yres: '540',
  frameRate: (1000 / 30) + ''
};

var broadcaster = false;

const port = process.env.PORT || 9001;
// API URLS
app.get("/ndi_return/video", function(req, res) {
  res.sendFile(__dirname + "/public/returnVideo.html");
});

app.get("/ndi_return/sender", function(req, res) {
  res.sendFile(__dirname + "/public/AudioVideo.html");
});
// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  // ########### Webrtc Sockets ##########
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    if (broadcaster) {
      socket.to(broadcaster).emit("watcher", socket.id);
    }
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("channelName", (id, message) => {
    socket.to(id).emit("channelName", socket.id, message);
  });

  socket.on("message", (message) => {
    console.log("::::::::::::::");
    console.log(message);
    console.log("::::::::::::::");
  });


  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
  socket.on("video frames", (video) => {
    if (videoProperties.id != video.id || videoProperties.channelName != video.channelName) {
      videoProperties.id = video.id
      videoProperties.channelName = video.channelName
      videoProperties.type = video.type
      videoProperties.xres = video.xres
      videoProperties.yres = video.yres
      videoProperties.frameRate = video.frameRate

      console.log("Creating new channel::::::::");
      ndi('create-send-video-channel', videoProperties);
    }
    var videoFrameIs = new Uint8ClampedArray(video.data);
    ndi("send-video", videoProperties, videoFrameIs.buffer);
    console.log("frame:::::::::::");
    // socket.to(broadcaster).emit("rgba_receiver", videoFrameIs.buffer);

  });


});



server.listen(port, () => console.log(`Server is running on port ${port}`));
