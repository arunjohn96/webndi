  class MainAudioProcessor extends AudioWorkletProcessor {
    i = 0;
    epoch_start = new Date().valueOf();


    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

      for (let channel = 0; channel < output.length; ++channel) {
        this.i++;
        var epoch_now = new Date().valueOf();
        var difference = epoch_now - this.epoch_start;
        if (difference>0) {
          console.log(Math.round((difference)/1000));
        }
        this.port.postMessage({
          audio_left: input[0].buffer,
        });
      }
      return true
    }
  }
  registerProcessor('main-audio-processor', MainAudioProcessor)
