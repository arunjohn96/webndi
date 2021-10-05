const express = require("express");
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
ndi = addon.ndi;
var videoProperties = {
  id: 'b001',
  type: 'video',
  channelName: 'testv',
  xres: '1280',
  yres: '720',
  frameRate: (1000 / 30) + ''
};
ndi('create-send-video-channel', videoProperties) ;
const port = process.env.PORT || 8000;

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on('video frames', video => {
    var videoFrameIs = new Uint8ClampedArray(video);
    ndi("send-video", videoProperties, videoFrameIs.buffer);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
