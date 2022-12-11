import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

class VoiceRecorder {
  constructor(apiUrl, onResult) {
    this.apiUrl = apiUrl;
    this.stream = null;
    this.recorder = null;
    this.onResult = onResult;
    this.audioData = [];
    this.finalAudioData = [];
    this.type = 'audio/wav';

    this.init();
  }

  async init() {
    await register(await connect());
  }

  async start(maxDuration, interval) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.recorder = new MediaRecorder(stream, {
        mimeType: this.type,
      });
      this.recorder.ondataavailable = this.handleDataAvailable.bind(this);
      this.recorder.start(maxDuration);

      // Clear the array thatof the recorded audio data
      this.audioData = [];

      // Send the recorded audio data to the server in intervals
      this.intervalId = setInterval(() => {
        this.stop();
        setTimeout(() => this.start(maxDuration, interval), 50);
      }, interval);
    });
  }

  stopByUser() {
    clearInterval(this.intervalId);
    this.stop();
  }

  stop() {
    clearInterval(this.intervalId);

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
      this.stream.getTracks().forEach(track => track.stop());

      // Create a new Blob object that contains all of the recorded audio data
      const audioBlob = new Blob(this.audioData);

      // Send the Blob object to the server
      this.sendAudioData(audioBlob);
    }
  }

  getFinalTranscript() {
    const audioBlob = new Blob(this.finalAudioData, {
      type: this.type,
    });
    this.sendAudioData(audioBlob, true);

    this.finalAudioData = [];
  }

  handleDataAvailable(event) {
    if (event.data.size > 0) {
      // Push the recorded data to the array
      this.audioData.push(event.data);
      this.finalAudioData.push(event.data);
    }
  }

  sendAudioData(audioData, final) {
    console.log(audioData);
    fetch(this.apiUrl, {
      method: 'POST',
      body: audioData,
    })
      .then(response => response.json())
      .then(data => {
        if (this.onResult) {
          this.onResult(data);
        }
      });
  }
}

const resultText = document.querySelector('.transcript');
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');
const finalButton = document.querySelector('.final');
const finalText = document.querySelector('.final-text');

const onResult = data => {
  const { transcript } = data.data;
  // Create a new element to display the text
  resultText.textContent += transcript;
};

const voiceRecorder = new VoiceRecorder(
  'http://localhost:5000/transcript',
  onResult
);

startButton.addEventListener('click', () => voiceRecorder.start(512, 1024 * 2));
stopButton.addEventListener('click', () => voiceRecorder.stopByUser());
finalButton.addEventListener('click', () => voiceRecorder.getFinalTranscript());
