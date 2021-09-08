'use strict';
var width = document.getElementById('videoResolution').value
var height = (width * 9) / 16;
var frameRate = getFrameRate();


//Defining some global utility variables
var isChannelReady = false;
var isInitiator = false;
var isStarted = false;
var pc;
var remoteStream;
var recordedStream = new MediaStream();
var turnReady;
var currentVTrackNo = 1;

let peerConnection;
const config = turnConfig;

const socket = io.connect(window.location.origin);
var streamSocket;

const video = document.querySelector("video");
const enableAudioButton = document.querySelector("#enable-audio");

let silence = () => {
  let ctx = new AudioContext(),
    oscillator = ctx.createOscillator();
  let dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  return Object.assign(dst.stream.getAudioTracks()[0], {
    enabled: false
  });
}
let black = ({
  width = 960,
  height = 540
} = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), {
    width,
    height
  });
  canvas.getContext('2d').fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], {
    enabled: false
  });
}
let blackSilence = () => new MediaStream([black(), silence()]);
var dummyStream = blackSilence();

//Displaying Stream on webpage
var remoteVideo1 = document.querySelector('#remoteVideo1');
// var remoteVideo2 = document.querySelector('#remoteVideo2');
// var remoteVideo3 = document.querySelector('#remoteVideo3');
// var remoteVideo4 = document.querySelector('#remoteVideo4');
// var remoteVideo5 = document.querySelector('#remoteVideo5');
// var remoteVideo6 = document.querySelector('#remoteVideo6');
// var remoteVideo7 = document.querySelector('#remoteVideo7');
// var remoteVideo8 = document.querySelector('#remoteVideo8');

// Video Tracks
var video1Track, video2Track, video3Track, video4Track, video5Track, video6Track, video7Track, video8Track;
// Meeting canvas emit variables
var video1TrackEmit, video2TrackEmit, video3TrackEmit, video4TrackEmit, video5TrackEmit, video6TrackEmit, video7TrackEmit, video8TrackEmit;
// Individual video streams on canvas
var streamEmit1, streamEmit2, streamEmit3, streamEmit4, streamEmit5, streamEmit6, streamEmit7, streamEmit8, emitCanvas;
// Boolean variables to identify valid streams
var streamCast1, streamCast2, streamCast3, streamCast4, streamCast5, streamCast6, streamCast7, streamCast8;
// variable to send Individual canvas videos
// var meetingCanvas = document.getElementById('meetingCanvas');
var streamCanvasEmit1, streamCanvasEmit2, streamCanvasEmit3, streamCanvasEmit4, streamCanvasEmit5, streamCanvasEmit6, streamCanvasEmit7, streamCanvasEmit8;
// var meetingCtx = meetingCanvas.getContext('2d');

let videoDrawConfig = [{
  'x': 1,
  'y': 0,
  'width': 240,
  'height': 135
}, {
  'x': 240,
  'y': 0,
  'width': 240,
  'height': 135
}, {
  'x': 480,
  'y': 0,
  'width': 240,
  'height': 135
}, {
  'x': 720,
  'y': 0,
  'width': 240,
  'height': 135
}, {
  'x': 0,
  'y': 135,
  'width': 240,
  'height': 135
}, {
  'x': 240,
  'y': 135,
  'width': 240,
  'height': 135
}, {
  'x': 480,
  'y': 135,
  'width': 240,
  'height': 135
}, {
  'x': 720,
  'y': 135,
  'width': 240,
  'height': 135
}]

let canvasOptions = {
  // 'height': meetingCanvas.height,
  // 'width': meetingCanvas.width,
  // 'canvas': meetingCanvas,
  // 'ctx': meetingCtx,
  'videoOptions': videoDrawConfig
}


InitializeStreams(dummyStream);


socket.on("offer", (id, description) => {
  // if (peerConnection === undefined){
  peerConnection = new RTCPeerConnection(config);
  // }

  peerConnection
    .setRemoteDescription(description)
    .then(() => peerConnection.createAnswer())
    .then(sdp => peerConnection.setLocalDescription(sdp))
    .then(() => {
      socket.emit("answer", id, peerConnection.localDescription);
    });
  peerConnection.ontrack = handleRemoteStreamAdded
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      socket.emit("candidate", id, event.candidate);
    }
  };
});

socket.on("candidate", (id, candidate) => {
  peerConnection
    .addIceCandidate(new RTCIceCandidate(candidate))
    .catch(e => console.error(e));
});

socket.on("connect", () => {
  socket.emit("watcher");
});

socket.on("broadcaster", () => {
  console.log("Got an incoming connection::::: broadcaster :::");
  socket.emit("watcher");
  console.log("Sending signal from panel to accept ::::: watcher :::");
});

window.onunload = window.onbeforeunload = () => {
  socket.close();
  peerConnection.close();
};

function handleRemoteStreamAdded(event) {
  console.log('Remote stream added.');
  var newStream = event.streams[0];
  console.log("Details of newly added Stream ::::", newStream);
  console.log("Switch :::::", currentVTrackNo);
  switch (currentVTrackNo) {
    case 1:
      console.log(newStream);
      remoteVideo1.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video1Track = track
      });
      console.log(video1Track);
      clearInterval(video1TrackEmit);
      video1TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video1Track, canvasOptions, 1)
      }, getFrameRate());
      displayStreamOnCanvas(video1Track, 'Bot', streamEmit1, 1);
      currentVTrackNo = 1;
      break;
    case 2:
      remoteVideo2.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video2Track = track
      });
      clearInterval(video2TrackEmit);
      video2TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video2Track, canvasOptions, 2)
      }, getFrameRate());
      displayStreamOnCanvas(video2Track, 'Alpha', streamEmit2, 2);
      currentVTrackNo += 1;
      break;
    case 3:
      remoteVideo3.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video3Track = track
      });
      clearInterval(video3TrackEmit);
      video3TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video3Track, canvasOptions, 3)
      }, getFrameRate());
      displayStreamOnCanvas(video3Track, 'Beta', streamEmit3, 3);
      currentVTrackNo += 1;
      break;
    case 4:
      remoteVideo4.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video4Track = track
      });
      clearInterval(video4TrackEmit);
      video4TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video4Track, canvasOptions, 4)
      }, getFrameRate());
      displayStreamOnCanvas(video4Track, 'Gamma', streamEmit4, 4);
      currentVTrackNo += 1;
      break;
    case 5:
      remoteVideo5.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video5Track = track
      });
      clearInterval(video5TrackEmit);
      video5TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video5Track, canvasOptions, 5)
      }, getFrameRate());
      displayStreamOnCanvas(video5Track, 'Delta', streamEmit5, 5);
      currentVTrackNo += 1;
      break;
    case 6:
      remoteVideo6.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video6Track = track
      });
      clearInterval(video6TrackEmit);
      video6TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video6Track, canvasOptions, 6)
      }, getFrameRate());
      displayStreamOnCanvas(video6Track, 'Epsilon', streamEmit6, 6);
      currentVTrackNo += 1;
      break;
    case 7:
      remoteVideo7.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video7Track = track
      });
      clearInterval(video7TrackEmit);
      video7TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video7Track, canvasOptions, 7)
      }, getFrameRate());
      displayStreamOnCanvas(video7Track, 'Zeta', streamEmit7, 7);
      currentVTrackNo += 1;
      break;
    case 8:
      remoteVideo8.srcObject = newStream;
      newStream.getVideoTracks().forEach(track => {
        video8Track = track
      });
      clearInterval(video8TrackEmit);
      video8TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(video8Track, canvasOptions, 8)
      }, getFrameRate());
      displayStreamOnCanvas(video8Track, 'Eta', streamEmit8, 8);
      currentVTrackNo += 1;
      break;

    default:
      currentVTrackNo = 1;
      break;
  }
}

function InitializeStreams(stream) {
  console.log('Initializing video elements::::.');
  // initializing each video element with a stream
  remoteVideo1.srcObject = dummyStream.clone();
  // remoteVideo2.srcObject = dummyStream.clone();
  // remoteVideo3.srcObject = dummyStream.clone();
  // remoteVideo4.srcObject = dummyStream.clone();
  // remoteVideo5.srcObject = dummyStream.clone();
  // remoteVideo6.srcObject = dummyStream.clone();
  // remoteVideo7.srcObject = dummyStream.clone();
  // remoteVideo8.srcObject = dummyStream.clone();

  // Getting VideoTrack from each video element
  remoteVideo1.srcObject.getVideoTracks().forEach(track => {
    video1Track = track;
  });
  // remoteVideo2.srcObject.getVideoTracks().forEach(track => {
  //   video2Track = track
  //   streamCast2 = false;
  // });
  // remoteVideo3.srcObject.getVideoTracks().forEach(track => {
  //   video3Track = track
  //   streamCast3 = false;
  // });
  // remoteVideo4.srcObject.getVideoTracks().forEach(track => {
  //   video4Track = track
  //   streamCast4 = false;
  // });
  // remoteVideo5.srcObject.getVideoTracks().forEach(track => {
  //   video5Track = track
  //   streamCast5 = false;
  // });
  // remoteVideo6.srcObject.getVideoTracks().forEach(track => {
  //   video6Track = track
  //   streamCast6 = false;
  // });
  // remoteVideo7.srcObject.getVideoTracks().forEach(track => {
  //   video7Track = track
  //   streamCast7 = false;
  // });
  // remoteVideo8.srcObject.getVideoTracks().forEach(track => {
  //   video8Track = track
  //   streamCast8 = false;
  // });

  //  NDI Broadcast Initializing
  streamCast1 = document.getElementById('BotStreamBroadcast').checked ? true : false
  // streamCast2 = document.getElementById('AlphaStreamBroadcast').checked ? true : false
  // streamCast3 = document.getElementById('BetaStreamBroadcast').checked ? true : false
  // streamCast4 = document.getElementById('GammaStreamBroadcast').checked ? true : false
  // streamCast5 = document.getElementById('DeltaStreamBroadcast').checked ? true : false
  // streamCast6 = document.getElementById('EpsilonStreamBroadcast').checked ? true : false
  // streamCast7 = document.getElementById('ZetaStreamBroadcast').checked ? true : false
  // streamCast8 = document.getElementById('EtaStreamBroadcast').checked ? true : false

  if (streamCast1 || streamCast2 || streamCast3 || streamCast4 || streamCast5 || streamCast6 || streamCast7 || streamCast8) {
    if (!streamSocket) {
      streamSocket = io("ws://localhost:80")
    }
  }

  // Draw each VideoTrack to a consolidated MeetingCanvas and seperate individual streamCanvas
  // video2TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video2Track, canvasOptions, 2)
  // }, getFrameRate());
  // displayStreamOnCanvas(video2Track, 'Alpha', streamEmit2, 2);
  //
  // video3TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video3Track, canvasOptions, 3)
  // }, getFrameRate());
  // displayStreamOnCanvas(video3Track, 'Beta', streamEmit3, 3);
  //
  // video4TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video4Track, canvasOptions, 4)
  // }, getFrameRate());
  // displayStreamOnCanvas(video4Track, 'Gamma', streamEmit4, 4);
  //
  // video5TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video5Track, canvasOptions, 5)
  // }, getFrameRate());
  // displayStreamOnCanvas(video5Track, 'Delta', streamEmit5, 5);
  //
  // video6TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video6Track, canvasOptions, 6)
  // }, getFrameRate());
  // displayStreamOnCanvas(video6Track, 'Epsilon', streamEmit6, 6);
  //
  // video7TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video7Track, canvasOptions, 7)
  // }, getFrameRate());
  // displayStreamOnCanvas(video7Track, 'Zeta', streamEmit7, 7);
  //
  // video8TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video8Track, canvasOptions, 8)
  // }, getFrameRate());
  // displayStreamOnCanvas(video8Track, 'Eta', streamEmit8, 8);

  // video1TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video1Track, canvasOptions, 1)
  // }, getFrameRate());
  displayStreamOnCanvas(video1Track, 'Bot', streamEmit1, 1);

}

function drawVideoOnMeetingCanvas(stream, canvasOptions, vIndex) {
  try {
    let imageCapture = new ImageCapture(stream);
    let pWidth = canvasOptions.videoOptions[vIndex - 1].width;
    let pHeight = canvasOptions.videoOptions[vIndex - 1].height;
    let x = canvasOptions.videoOptions[vIndex - 1].x;
    let y = canvasOptions.videoOptions[vIndex - 1].y;
    // console.log("DMC::",x,y,pWidth,pHeight);
    imageCapture.grabFrame()
      .then((imageBitmap) => {
        canvasOptions.ctx.drawImage(imageBitmap, x, y, pWidth, pHeight);
      })
      .catch(() => {
        if (stream.canvas) {
          canvasOptions.ctx.drawImage(stream.canvas, x, y, pWidth, pHeight);
        }
      })
  } catch (e) {
    console.log("drawVideoOnMeetingCanvas:::::try-catch fail::");
  }
}
// ############## Displaying Local Camera Source on canvas
function displayStreamOnCanvas(stream, canvasName, trackEmit, trackNumber) {
  var canvas = document.getElementById(canvasName);
  var ctx = canvas.getContext('2d');
  canvas.width = width;
  canvas.height = height;

  let canvasOptions = {
    'name': canvasName,
    'height': canvas.height,
    'width': canvas.width,
    'canvas': canvas,
    'ctx': ctx,
    'videoOptions': [{
      'x': 0,
      'y': 0,
      'width': width,
      'height': height
    }]
  }

  switch (trackNumber) {
    case 1:
      clearInterval(video1TrackEmit)
      video1TrackEmit = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast1) {
        clearInterval(streamCanvasEmit1);
        streamCanvasEmit1 = setInterval(() => {
          sendStream(stream, canvasOptions, 1);
        }, getFrameRate());
      } else {
        clearInterval(streamCanvasEmit1);
      }

      break;
    case 2:
      clearInterval(streamEmit2)
      streamEmit2 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());
      if (streamCast2) {
        clearInterval(streamCanvasEmit2);
        streamCanvasEmit2 = setInterval(() => {
          sendStream(stream, canvasOptions, 2);
        }, getFrameRate());

      } else {

        clearInterval(streamCanvasEmit2);
      }

      break;
    case 3:
      clearInterval(streamEmit3)
      streamEmit3 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast3) {
        clearInterval(streamCanvasEmit3);
        streamCanvasEmit3 = setInterval(() => {
          sendStream(stream, canvasOptions, 3);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit3);

      }
      break;
    case 4:
      clearInterval(streamEmit4)
      streamEmit4 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast4) {
        clearInterval(streamCanvasEmit4);
        streamCanvasEmit4 = setInterval(() => {
          sendStream(stream, canvasOptions, 4);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit4);

      }
      break;
    case 5:
      clearInterval(streamEmit5)
      streamEmit5 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast5) {
        clearInterval(streamCanvasEmit5);
        streamCanvasEmit5 = setInterval(() => {
          sendStream(stream, canvasOptions, 5);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit5);

      }
      break;
    case 6:
      clearInterval(streamEmit6)
      streamEmit6 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast6) {
        clearInterval(streamCanvasEmit6);
        streamCanvasEmit6 = setInterval(() => {
          sendStream(stream, canvasOptions, 6);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit6);

      }
      break;
    case 7:
      clearInterval(streamEmit7)
      streamEmit7 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast7) {
        clearInterval(streamCanvasEmit7);
        streamCanvasEmit7 = setInterval(() => {
          sendStream(stream, canvasOptions, 7);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit7);

      }
      break;
    case 8:
      clearInterval(streamEmit8)
      streamEmit8 = setInterval(() => {
        drawVideoOnMeetingCanvas(stream, canvasOptions, 1);
      }, getFrameRate());

      if (streamCast8) {
        clearInterval(streamCanvasEmit8);
        streamCanvasEmit8 = setInterval(() => {
          sendStream(stream, canvasOptions, 8);
        }, getFrameRate());

      } else {
        clearInterval(streamCanvasEmit8);

      }
      break;

    default:
      break;

  }

}

// function sendMeetingCanvas() {
//   const canvas = document.getElementById('meetingCanvas');
//   const ctx = canvas.getContext('2d');
//   var frame = ctx.getImageData(0, 0, meetingCanvas.width, meetingCanvas.height);
//   streamSocket.emit('video frames', {
//     'id': 'meetingCanvas'.concat(meetingCanvas.width),
//     'channelName': 'meetingCanvas'.concat(meetingCanvas.width),
//     'height': meetingCanvas.height,
//     'width': meetingCanvas.width,
//     'frameRate': getFrameRate(),
//     'data': frame.data
//   });
// }

function sendStream(stream, canvasOptions, trackNumber) {
  let imageCapture = new ImageCapture(stream);
  const canvas = canvasOptions.canvas
  const ctx = canvasOptions.ctx
  var frame = ctx.getImageData(0, 0, canvasOptions.width, canvasOptions.height);
  streamSocket.emit('video frames', {
    'id': (canvasOptions.name).concat(canvasOptions.width),
    'channelName': (canvasOptions.name).concat(canvasOptions.width),
    'height': canvasOptions.height,
    'width': canvasOptions.width,
    'frameRate': getFrameRate(),
    'data': frame.data
  });
}

function getFrameRate() {
  // console.log("Frame rate", document.querySelector("select#frameRate").value );
  return 1000 / parseInt(document.querySelector("select#frameRate").value)
}

document.getElementById('frameRate').addEventListener('change', () => {
  frameRate = getFrameRate()
  clearInterval(video1TrackEmit)
  // clearInterval(video2TrackEmit)
  // clearInterval(video3TrackEmit)
  // clearInterval(video4TrackEmit)
  // clearInterval(video5TrackEmit)
  // clearInterval(video6TrackEmit)
  // clearInterval(video7TrackEmit)
  // clearInterval(video8TrackEmit)
  clearInterval(streamEmit1)
  // clearInterval(streamEmit2)
  // clearInterval(streamEmit3)
  // clearInterval(streamEmit4)
  // clearInterval(streamEmit5)
  // clearInterval(streamEmit6)
  // clearInterval(streamEmit7)
  // clearInterval(streamEmit8)

  // video1TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video1Track, canvasOptions, 1)
  // }, getFrameRate());
  displayStreamOnCanvas(video1Track, 'Bot', streamEmit1, 1);

  // video2TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video2Track, canvasOptions, 2)
  // }, getFrameRate());
  // displayStreamOnCanvas(video2Track, 'Alpha', streamEmit2, 2);
  //
  // video3TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video3Track, canvasOptions, 3)
  // }, getFrameRate());
  // displayStreamOnCanvas(video3Track, 'Beta', streamEmit3, 3);
  //
  // video4TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video4Track, canvasOptions, 4)
  // }, getFrameRate());
  // displayStreamOnCanvas(video4Track, 'Gamma', streamEmit4, 4);
  // video5TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video5Track, canvasOptions, 5)
  // }, getFrameRate());
  // displayStreamOnCanvas(video5Track, 'Delta', streamEmit5, 5);
  //
  // video6TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video6Track, canvasOptions, 6)
  // }, getFrameRate());
  // displayStreamOnCanvas(video6Track, 'Epsilon', streamEmit6, 6);
  //
  // video7TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video7Track, canvasOptions, 7)
  // }, getFrameRate());
  // displayStreamOnCanvas(video7Track, 'Zeta', streamEmit7, 7);
  //
  // video8TrackEmit = setInterval(() => {
  //   drawVideoOnMeetingCanvas(video8Track, canvasOptions, 8)
  // }, getFrameRate());
  // displayStreamOnCanvas(video8Track, 'Eta', streamEmit8, 8);
  // console.log(getFrameRate());

  // if (document.getElementById('meetingCanvasBroadcast').checked) {
  //   clearInterval(emitCanvas)
  //   emitCanvas = setInterval(sendMeetingCanvas, getFrameRate())
  // } else {
  //   clearInterval(emitCanvas)
  // }
})
document.getElementById('videoResolution').addEventListener("change", () => {
  width = document.getElementById('videoResolution').value
  height = (width * 9) / 16;
  clearInterval(streamEmit1)
  // clearInterval(streamEmit2)
  // clearInterval(streamEmit3)
  // clearInterval(streamEmit4)
  // clearInterval(streamEmit5)
  // clearInterval(streamEmit6)
  // clearInterval(streamEmit7)
  // clearInterval(streamEmit8)
  displayStreamOnCanvas(video1Track, 'Bot', streamEmit1, 1);
  // displayStreamOnCanvas(video2Track, 'Alpha', streamEmit2, 2);
  // displayStreamOnCanvas(video3Track, 'Beta', streamEmit3, 3);
  // displayStreamOnCanvas(video4Track, 'Gamma', streamEmit4, 4);
  // displayStreamOnCanvas(video5Track, 'Delta', streamEmit5, 5);
  // displayStreamOnCanvas(video6Track, 'Epsilon', streamEmit6, 6);
  // displayStreamOnCanvas(video7Track, 'Zeta', streamEmit7, 7);
  // displayStreamOnCanvas(video8Track, 'Eta', streamEmit8, 8);
});
// document.getElementById('meetingCanvasBroadcast').addEventListener('change', () => {
//
//   if (document.getElementById('meetingCanvasBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     clearInterval(emitCanvas)
//     emitCanvas = setInterval(sendMeetingCanvas, getFrameRate())
//   } else {
//     clearInterval(emitCanvas)
//     console.log("Stopped:::");
//   }
// })
document.getElementById('BotStreamBroadcast').addEventListener('change', () => {
  if (document.getElementById('BotStreamBroadcast').checked) {
    if (!streamSocket) {
      streamSocket = io("ws://localhost:80")
    }
    streamCast1 = true;
    displayStreamOnCanvas(video1Track, 'Bot', video1TrackEmit, 1);

  } else {
    streamCast1 = false;
    clearInterval(streamCanvasEmit1)
    console.log("Stopped:::");

  }
})
// document.getElementById('AlphaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('AlphaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast2 = true;
//     displayStreamOnCanvas(video2Track, 'Alpha', streamEmit2, 2);
//   } else {
//     streamCast2 = false;
//     clearInterval(streamCanvasEmit2)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('BetaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('BetaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast3 = true;
//     displayStreamOnCanvas(video3Track, 'Beta', streamEmit3, 3);
//   } else {
//     streamCast3 = false;
//     clearInterval(streamCanvasEmit3)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('GammaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('GammaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast4 = true;
//     displayStreamOnCanvas(video4Track, 'Gamma', streamEmit4, 4);
//   } else {
//     streamCast4 = false;
//     clearInterval(streamCanvasEmit4)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('DeltaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('DeltaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast5 = true;
//     displayStreamOnCanvas(video5Track, 'Delta', streamEmit5, 5);
//   } else {
//     streamCast5 = false;
//     clearInterval(streamCanvasEmit5)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('EpsilonStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('EpsilonStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast6 = true;
//     displayStreamOnCanvas(video6Track, 'Epsilon', streamEmit6, 6);
//   } else {
//     streamCast6 = false;
//     clearInterval(streamCanvasEmit6)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('ZetaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('ZetaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast7 = true;
//     displayStreamOnCanvas(video7Track, 'Zeta', streamEmit7, 7);
//   } else {
//     streamCast7 = false;
//     clearInterval(streamCanvasEmit7)
//     console.log("Stopped:::");
//   }
// })
// document.getElementById('EtaStreamBroadcast').addEventListener('change', () => {
//   if (document.getElementById('EtaStreamBroadcast').checked) {
//     if (!streamSocket) {
//       streamSocket = io("ws://localhost:80")
//     }
//     streamCast8 = true;
//     displayStreamOnCanvas(video8Track, 'Eta', streamEmit8, 8);
//   } else {
//     streamCast8 = false;
//     clearInterval(streamCanvasEmit8)
//     console.log("Stopped:::");
//   }
// })
