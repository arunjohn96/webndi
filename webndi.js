const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const fs = require('fs')
const AWS = require("aws-sdk");
const io = require("socket.io")(server, {
  cors: {
    origin: '*',
  },
  maxHttpBufferSize: 1e8
});
const addon = require('bindings')('ndi');
app.use('/static', express.static('public'))
ndi = addon.ndi;



let broadcaster, clearcheck;
var endMeetingFlag = false;
const port = process.env.PORT || 9000;

function success(err, id, type) {
  // console.log(`successfully send ${type} frame - [${id}]`) ;
}
// API URLS
app.get("/stream/meeting", function(req, res) {
  res.sendFile(__dirname + "/public/broadcast.html");
});
app.get("/stream/multibroadcast", function(req, res) {
  res.sendFile(__dirname + "/public/multibroadcast.html");
});
app.get("/stream/audio", function(req, res) {

  res.sendFile(__dirname + "/public/AudioBuffer.html");
});

app.get("/stream/video", function(req, res) {

  res.sendFile(__dirname + "/public/AudioVideoBuffer.html");
});
app.get("/stream/video_demo", function(req, res) {
  res.sendFile(__dirname + "/public/AudioVideoBuffer2.html");
});
app.get("/stream/panel", function(req, res) {
  res.sendFile(__dirname + "/public/watch.html");
});
app.get("/stream/ndi_receiver", function(req, res) {
  res.sendFile(__dirname + "/public/ndi_receiver.html");
});

app.get("/stream/stopRecording", function(req, res) {
  endMeetingFlag = true;
  res.end('success')
})


// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {

  // ########### Webrtc Sockets ##########
  socket.on("broadcaster", () => {
    broadcaster = socket.id;
    socket.broadcast.emit("broadcaster");
  });
  socket.on("watcher", () => {
    socket.to(broadcaster).emit("watcher", socket.id);
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
  socket.on("startRecording", (id, roomName, eventId, externalUserID) => {
    socket.to(id).emit("startRecording", roomName, eventId, externalUserID);
    endMeetingFlag = false;
  });

  clearcheck = setInterval(() => {
    if (endMeetingFlag) {
      socket.broadcast.emit("stopRecording");
    }
  }, 1000);

  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
