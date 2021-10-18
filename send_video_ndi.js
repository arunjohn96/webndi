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
  id: 'v001',
  type: 'video',
  channelName: 'testv',
  xres: '960',
  yres: '540',
  frameRate: (1000 / 30) + ''
};
// ndi('create-send-video-channel', videoProperties) ;
const port = process.env.PORT || 8000;

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  socket.on('video frames', video => {
    if (videoProperties.id != video.id || videoProperties.channelName != video.channelName) {
      videoProperties.id = video.id
      videoProperties.channelName = video.channelName
      videoProperties.type = video.type
      videoProperties.xres = video.xres
      videoProperties.yres = video.yres
      videoProperties.frameRate = video.frameRate

      ndi('create-send-video-channel', videoProperties);

    }
    var videoFrameIs = new Uint8ClampedArray(video.data);
    ndi("send-video", videoProperties, videoFrameIs.buffer);
  });
});

server.listen(port, () => console.log(`Server is running on port ${port}`));
