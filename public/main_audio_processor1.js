  class MainAudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

      for (let channel = 0; channel < output.length; ++channel) {
        console.log("Here:: ", input[0]);
        //   this.port.postMessage({
        //     audio_left: input[0].buffer,
        //   });
        //   // input[channel].set(this._input[channel]);
      }

      // if (this._audio_flag) {
      //
      //   for (let channel = 0; channel < input.length; ++channel) {
      //     for (let i = 0; i < input[channel].length; ++i) {
      //       // Just copying all the data from input to output
      //       output[channel][i] = this._audio_channel[channel][i];
      //       // output[channel][i] = Math.random() * 2 - 1
      //       // The next one will make the app crash but yeah, the values are there
      //     }
      //   }
      //   // console.log("message from main-audio-processor ::::", input.length,output.length );
      //   this._audio_flag = true
      // }

      return true
    }
  }
  registerProcessor('main-audio-processor', MainAudioProcessor)
