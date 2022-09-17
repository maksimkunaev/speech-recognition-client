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

export class VolumeDetector {
  isSpeaking = false;
  onSpeechStart = () => {};
  onVoidDetected = () => {};
  timer = null;
  minVolumeTreshhold = 14;
  minSilenceDelay = 900;
  isActive = false;

  startTime: number;
  speechStartTime: number;

  start = () => {
    this.isActive = true;
  };
  stop = () => {
    this.isActive = false;
  };

  constructor(stream, onSpeechStart, onVoidDetected) {
    this.onSpeechStart = onSpeechStart;
    this.onVoidDetected = onVoidDetected;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;
    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
    scriptProcessor.onaudioprocess = () => {
      if (!this.isActive) {
        return;
      }

      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const arraySum = array.reduce((a, value) => a + value, 0);
      const average = arraySum / array.length;

      {
        // if high level of volume detected we trigger "onspeechstart" event and set isSpeaking to true

        if (average > this.minVolumeTreshhold) {
          if (!this.isSpeaking) {
            this.isSpeaking = true;
            this.onSpeechStart();

            this.speechStartTime = Date.now();
            // console.log('volumeDetector: onSpeechStart()');
          } else if (this.timer) {
            // console.log('volumeDetector clearTimeout', this.timer);
            clearTimeout(this.timer);
            this.timer = null;
          }
        }

        // if low level of volume detected we set timer to 1 second and set flag this timer is running
        // and if after 1 second volume is still low we trigger "onVoidDetected" event and set isSpeaking to false
        // if volume is high again before 1 second we reset timer to 1 second
        // console.log('average >', average);

        // TODO define silence as a sharp and continuous transition of levels from high to low sound (no specific values)
        if (
          average < this.minVolumeTreshhold &&
          this.isSpeaking &&
          !this.timer
        ) {
          this.startTime = Date.now();
          this.timer = setTimeout(() => {
            // const duration = Date.now() - this.startTime;
            // const duration2 = Date.now() - this.speechStartTime;
            Date.now() - this.startTime;
            this.isSpeaking = false;
            this.onVoidDetected();
            this.timer = null;

            // console.log(
            //   'volumeDetector: onVoidDetected()',
            //   duration,
            //   duration2
            // );
          }, this.minSilenceDelay);

          // console.log('volumeDetector setTimeout', this.timer);
        }
      }
    };
  }
}
