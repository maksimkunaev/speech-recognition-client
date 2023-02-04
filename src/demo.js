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
  const text = document.createElement('p');
  text.textContent = `[${chunkId}]: ${transcript}`;
  resultText.appendChild(text);
  state.transcript[chunkId] = transcript;
  console.log('transcript', state.transcript);
  console.log('\n');
};

const voiceRecorder = new SpeechRecognition(apiURL, onResult);

startButton.addEventListener('click', () => voiceRecorder.start(1024 * 3));
stopButton.addEventListener('click', () => voiceRecorder.stop());
