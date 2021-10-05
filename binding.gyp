{
  "targets": [
    {
      "target_name": "ndi",
      "cflags!": [ "-fno-exceptions" ],
      "cflags": [ "-std=c++11" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [
        "./ndi/src/sendaudio.cpp",
        "./ndi/src/sendvideo.cpp",
        "./ndi/src/receiveaudio.cpp",
        "./ndi/src/receivevideo.cpp",
        "./ndi/src/audiomanager.cpp",
        "./ndi/src/videomanager.cpp",
        "./ndi/src/framemanager.cpp"
      ],
       "include_dirs": [
        "ndi/include",
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      "libraries": [ "-L<(module_root_dir)/ndi/lib", "-lndi.4" ],
      "link_settings": {
         "libraries": [
         "-Wl,-rpath,@loader_path/../../ndi/lib"
       ],
      },
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
    }
  ]
}

