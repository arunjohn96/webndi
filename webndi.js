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



let broadcaster;
const port = process.env.PORT || 80;

function success(err, id, type) {
  // console.log(`successfully send ${type} frame - [${id}]`) ;
}

// API URLS
app.get("/meeting", function(req, res) {
  res.sendFile(__dirname + "/public/broadcast.html");
});
app.get("/multibroadcast", function(req, res) {
  res.sendFile(__dirname + "/public/multibroadcast.html");
});
app.get("/audio", function(req, res) {

  res.sendFile(__dirname + "/public/AudioBuffer.html");
});

app.get("/video", function(req, res) {

  res.sendFile(__dirname + "/public/AudioVideoBuffer.html");
});
app.get("/video_demo", function(req, res) {
  res.sendFile(__dirname + "/public/AudioVideoBuffer2.html");
});
app.get("/panel", function(req, res) {
  res.sendFile(__dirname + "/public/watch.html");
});
app.get("/ndi_receiver", function(req, res) {
  res.sendFile(__dirname + "/public/ndi_receiver.html");
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
    socket.to(broadcaster).emit("watcher", socket.id);
  });
  socket.on("offer", (id, message) => {
    socket.to(id).emit("offer", socket.id, message);
  });
  socket.on("answer", (id, message) => {
    socket.to(id).emit("answer", socket.id, message);
  });
  socket.on("candidate", (id, message) => {
    socket.to(id).emit("candidate", socket.id, message);
  });
  socket.on("disconnect", () => {
    socket.to(broadcaster).emit("disconnectPeer", socket.id);
  });

  socket.on("browser", (ExternalUserID) => {
    browser_list[ExternalUserID] = socket.id
    console.log("Browser List:::::::", browser_list);
  });
  socket.on("server", () => {
    var number_of_servers = Object.keys(server_list).length
    server_list[str(number_of_servers + 1)] = socket.id
    console.log("Server List:::::::", browser_list);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
