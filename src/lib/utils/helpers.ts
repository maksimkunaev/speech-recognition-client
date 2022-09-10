export function saveAudio(chunks) {
  const soundClips = <HTMLElement>document.querySelector('#soundClips');

  const clipName = 'example-test';

  const clipContainer = document.createElement('article');
  const clipLabel = document.createElement('p');
  const audio = document.createElement('audio');
  const deleteButton = document.createElement('button');

  clipContainer.classList.add('clip');
  audio.setAttribute('controls', '');
  deleteButton.textContent = 'Delete';
  clipLabel.textContent = clipName;

  clipContainer.appendChild(audio);
  clipContainer.appendChild(clipLabel);
  clipContainer.appendChild(deleteButton);
  soundClips.appendChild(clipContainer);

  audio.controls = true;
  const blob = new Blob(chunks);
  const audioURL = URL.createObjectURL(blob);
  audio.src = audioURL;
}

export class CheckVolume {
  isSpeaking = false;
  onSpeechStart = () => {};
  onSpeechEnd = () => {};
  timer = null;
  minVolumeTreshhold = 20;
  minSilenceDelay = 700;

  constructor(stream, onSpeechStart, onSpeechEnd) {
    this.onSpeechStart = onSpeechStart;
    this.onSpeechEnd = onSpeechEnd;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    const that = this;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    scriptProcessor.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;

      {
        // if high level of volume detected we trigger "onspeechstart" event and set isSpeaking to true

        if (average > this.minVolumeTreshhold) {
          if (!that.isSpeaking) {
            that.isSpeaking = true;
            that.onSpeechStart();
          } else {
            clearTimeout(that.timer);
            that.timer = null;
          }
        }

        // if low level of volume detected we set timer to 1 second and set flag that timer is running
        // and if after 1 second volume is still low we trigger "onspeechend" event and set isSpeaking to false
        // if volume is high again before 1 second we reset timer to 1 second

        if (average < this.minVolumeTreshhold) {
          if (that.isSpeaking) {
            if (!that.timer) {
              that.timer = setTimeout(() => {
                that.isSpeaking = false;
                that.onSpeechEnd();
                that.timer = null;
              }, this.minSilenceDelay);
            }
          }
        }
      }
    };
  }
}
