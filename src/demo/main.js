import { MediaRecorder, register } from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

class VoiceRecorder {
  constructor(apiUrl, onResult) {
    this.apiUrl = apiUrl;
    this.stream = null;
    this.recorder = null;
    this.onResult = onResult;
    this.chunkAudioData = [];
    this.allAudioData = [];
    this.mimeType = 'audio/wav';
    this.chunkId = 0;

    this.init();
  }

  async init() {
    await register(await connect());
  }

  async start(maxDuration, interval) {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      this.stream = stream;
      this.recorder = new MediaRecorder(stream, {
        mimeType: this.mimeType,
      });
      this.recorder.ondataavailable = this.handleDataAvailable.bind(this);
      this.recorder.start(maxDuration);

      // Clear the array that of the recorded audio data
      this.chunkAudioData = [];

      // Send the recorded audio data to the server in intervals
      this.intervalId = setTimeout(() => {
        this.stop();
        setTimeout(() => this.start(maxDuration, interval), 20);
      }, interval);
    });
  }

  stop() {
    // clearTimeout(this.intervalId);

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
      this.stream.getTracks().forEach(track => track.stop());

      // Create a new Blob object that contains all of the recorded audio data
      const audioBlob = new Blob(this.chunkAudioData);

      // Send the Blob object to the server
      this.sendAudioData(audioBlob, this.chunkId);
      this.chunkId++;
    }
  }

  handleDataAvailable(event) {
    if (event.data.size > 0) {
      // Push the recorded data to the array
      this.chunkAudioData.push(event.data);
      this.allAudioData.push(event.data);
    }
  }

  stopByUser() {
    clearInterval(this.intervalId);
    this.stop();
    this.getFinalTranscript();
  }

  getFinalTranscript() {
    const audioBlob = new Blob(this.allAudioData, {
      type: this.mimeType,
    });
    this.sendAudioData(audioBlob, 'final');
    this.allAudioData = [];
  }

  sendAudioData(audioData, chunkId) {
    const formData = new FormData();
    formData.append('sample', audioData, 'filename.wav');
    formData.append('chunk_id', chunkId);

    fetch(this.apiUrl, {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then(data => {
        if (this.onResult) {
          this.onResult(chunkId, data);
        }
      })
      .catch(err => {
        console.log('Error', chunkId, err.message);
      });
  }
}

const resultText = document.querySelector('.transcript');
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');

let state = {
  transcript: [],
};

const onResult = (chunkId, data) => {
  const { transcript } = data.data;
  // Create a new element to display the text
  // console.log('onResult', chunkId, data, transcript);
  // resultText.textContent += transcript;
  state.transcript[chunkId] = transcript;
  console.log('transcript', state.transcript);
  console.log('\n');
};

const voiceRecorder = new VoiceRecorder(
  'http://localhost:5000/transcript',
  onResult
);

startButton.addEventListener('click', () => voiceRecorder.start(512, 1024 * 2));
stopButton.addEventListener('click', () => voiceRecorder.stopByUser());
