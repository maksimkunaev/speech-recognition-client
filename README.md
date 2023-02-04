# Speech recognition client for custom API

## Backend
[speech-recognition-backend](https://github.com/maksimkunaev/speech-recognition-backend)

## Install 

`npm i speech-recognition-client`


## Usage

```javascript
import SpeechRecognition from 'speech-recognition-client';

const apiURL = 'http://127.0.0.1:5000/transcript';
const resultText = document.querySelector('.transcript');
const startButton = document.querySelector('.start');
const stopButton = document.querySelector('.stop');

const onResult = (chunkId, data) => {
  const { transcript } = data.data;
  resultText.textContent += transcript;
  console.log('transcript', state.transcript);
};

const speechRecognition = new SpeechRecognition(apiURL, onResult);

startButton.addEventListener('click', () => speechRecognition.start(1024 * 2)); // send request to API every 2 seconds
stopButton.addEventListener('click', () => speechRecognition.stop());
```

## Run server

`./node_modules/.bin/serve src -p 3000`

## Run client demo

`npm run dev`
