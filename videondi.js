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

const audioProperties = {
    id: 'a001',
    type: 'audio',
    channelName: 'test-a1',
    sampleRate: '48000',
    noOfChannels: '2',
    bytesPerSample:'4',
    webFrameRate: '45',
    webChannelStride: '128',
    ndiChannelStride: '48000'
};

var videoProperties = {
  id: 'b001',
  type: 'video',
  channelName: 'testv',
  xres: '480',
  yres: '320',
  frameRate: (1000 / 30) + ''
};
var videoProperties2 = {
  id: 'b002',
  type: 'video',
  channelName: 'testv2',
  xres: '480',
  yres: '320',
  frameRate: (1000 / 15) + ''
};

ndi('create-send-audio-channel', audioProperties) ;
ndi('create-send-video-channel', videoProperties) ;

let broadcaster;
const port = process.env.PORT || 8000;

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

app.get("/browser", function(req, res) {
  res.sendFile(__dirname + "/public/browser.html");
});
app.get("/server", function(req, res) {
  res.sendFile(__dirname + "/public/server.html");
});

function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    view[i] = buf[i];
  }
  return ab;
}

function toBuffer(ab) {
  var buf = Buffer.alloc(ab.byteLength);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; ++i) {
    buf[i] = view[i];
  }
  return buf;
}
const server_list = {}
const browser_list = {}

// SOCKET URLS
io.sockets.on("error", e => console.log(e));
io.sockets.on("connection", socket => {
  // ########### NDI sockets ###########
  socket.on('audio_buffer', function(msg) {
    // const audio_buf = new DataView(toArrayBuffer(toBuffer(msg)))

  })

  socket.on('audio frames', audio => {
    var audioFrameIs = new Uint8Array(audio.data);
    ndi("send-audio", audioProperties, audioFrameIs.buffer);
	//ndi('sync', audioProperties, audioFrameIs.buffer, success);
  });

  socket.on('video frames', video => {
    var videoFrameIs = new Uint8ClampedArray(video);
    // var videoFrameIs2 = new Uint8ClampedArray(video);
    ndi("send-video", videoProperties, videoFrameIs.buffer);
    //ndi('sync', videoProperties, videoFrameIs.buffer, success);
    // ndi('sync', videoProperties2, videoFrameIs2.buffer, success);
  });
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

// executeNDI();

function executeNDI() {
  fs.readFile(__dirname + '/public/data.raw', (err, data) => {
    if (err) {
      console.error(err)
      return
    }
    const output_raw = new DataView(toArrayBuffer(data)) // 80000
    const audio_buffer = new Float32Array(output_raw.buffer) //20000
    console.log(output_raw.byteLength, "DataViewLength:::");
    console.log(audio_buffer.length, "ArrayBuffer Length:::");
    const sample_size = 8
    const channelStride = 512
    audioProperties.sampleRate = '128000'
    audioProperties.noOfChannels = '1'
    audioProperties.noOfSamples = sample_size + ''
    audioProperties.channelStride = channelStride + ''
    var i = 0;
    const audio_frame = new Float32Array(audio_buffer.slice(i * sample_size, i * sample_size + (sample_size - 1)).buffer)
    console.log(audio_frame);

    // setInterval(()=>{
    //   const audio_frame = new Float32Array(audio_buffer.slice(i * sample_size, i * sample_size + (sample_size-1)).buffer)
    //   console.log(audio_frame[0], audio_frame[1], i);
    //   ndi('sync', audioProperties, audio_frame.buffer , success);
    //   i++
    //   if (i<2){
    //     i=0;
    //   }
    // },100)
    // Worked for 1920,43
    // console.log("Checking :::::: Length (ffmpeg, recieved data) :::", '('+data.length+','+ msg.length+')');
    console.log("Checking :::::: ffmpeg :::", output_raw.getFloat32(0, false));
    console.log("Checking :::::: ffmpeg :::", output_raw.getFloat32(0, true));
    // console.log("Checking :::::: recieved data :::", audio_buf.getFloat32(audio_buf.length, false));
  })
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
