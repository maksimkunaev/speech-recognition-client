import SpeechRecognition from './main';

const apiURL = 'http://127.0.0.1:5000/transcript';
const resultText = document.querySelector('.transcript');
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');

const state = {
  transcript: [],
};

const onResult = (chunkId, data) => {
  const { transcript } = data.data;
  resultText.textContent += transcript;
  state.transcript[chunkId] = transcript;
  console.log('transcript', state.transcript);
  console.log('\n');
};

const voiceRecorder = new SpeechRecognition(apiURL, onResult);

startButton.addEventListener('click', () => voiceRecorder.start(512, 1024 * 8));
stopButton.addEventListener('click', () => voiceRecorder.stop());
