class MainAudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      const output = outputs[0];

	  var stride=0;
	  input.forEach((channel) => {stride+=channel.length});
      var data = new Float32Array(stride);

	  stride=0;
      input.forEach((channel) => {data.set(channel,stride); stride+=channel.length});
    // console.log(input[0]);
	  this.port.postMessage({data: data.buffer, channels: inputs[0].length, stride: stride});
      return true
    }
 }
 registerProcessor('main-audio-processor', MainAudioProcessor)
