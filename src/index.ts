import { getReply } from './api/get-reply';
import SpeechRecognition from './speech-recognition';
const transcriptEl = <HTMLElement>document.querySelector('.transcript');
const replyEl = <HTMLElement>document.querySelector('.reply');
const statusEl = <HTMLElement>document.querySelector('.status');
const recordEl = <HTMLElement>document.querySelector('.record');
const stopEl = <HTMLElement>document.querySelector('.stop');

const recognizeUrl = 'http://localhost:5000/transcript';
const replyUrl = 'http://localhost:5000/gpt';

const recognition = new SpeechRecognition(recognizeUrl);

const start = async () => {
  recognition.start();
  statusEl.classList.add('active');
};

const stop = () => {
  recognition.stop();
  statusEl.classList.remove('active');
};

recognition.onspeechend = () => {
  setTimeout(() => {
    start();
  }, 50);
};

recognition.onresult = async event => {
  const { transcript } = event.results[0][0];
  transcriptEl.textContent = transcript;

  const reply = await getReply(replyUrl, transcript);
  replyEl.textContent = reply;
};

recordEl.addEventListener('click', start);
stopEl.addEventListener('click', stop);
