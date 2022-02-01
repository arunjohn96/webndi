turnConfig = {
  iceServers: [{
    urls: ["stun:global.stun.twilio.com:3478"]
  }, {
    username: "22b3838d923a0f30d9ea922094c6f6b180d477a6d85e3440e8e7a0534ec42095",
    credential: "Mz5S7MAKEKf2cxzObg23xX0a2KxSsODqBGK+PBSx1M0=",
    urls: ["turn:global.turn.twilio.com:3478"]
  }]
};
turnConfig = {
  iceServers: [{
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
        "stun:stun3.l.google.com:19302",
        "stun:stun4.l.google.com:19302"
      ]
    },
    {
      username: "test",
      credential: "test",
      urls: [
        "turn:34.203.86.136:3478"
      ]
    }
  ]
};
