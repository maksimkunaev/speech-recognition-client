import { getReply } from './api/get-reply';
import SpeechRecognition from './speech-recognition';
import SpeechSynthesiser from './speech-synthesis';
import { Author } from './types';

const messagesEl = <HTMLElement>document.querySelector('.messages');
const toggleEl = <HTMLElement>document.querySelector('.toggle');

const recognizeUrl = 'http://localhost:5000/transcript';
const replyUrl = 'http://localhost:5000/gpt';

const recognition = new SpeechRecognition(recognizeUrl);
const speechSynthesiser = new SpeechSynthesiser();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

const state = {
  recording: false,
  stopText: '⏹️',
  playText: '🎙️',
  messages: [],
  isStopped: false,
};

const start = async () => {
  recognition.start();
  toggleEl.classList.add('animate');
  state.isStopped = false;
};

const stop = () => {
  recognition.stop();
  toggleEl.classList.remove('animate');
  state.isStopped = true;
};

recognition.onspeechend = () => {
  recognition.stop();
};

recognition.onerror = event => {
  console.log(`Error occurred in recognition: ${event.error}`);
};

recognition.onend = () => {
  if (state.isStopped) {
    return;
  }
  setTimeout(start, 0);
};

recognition.onresult = async event => {
  const { transcript } = event.results[0][0];

  if (transcript === '') {
    return;
  }
  state.messages.push({
    text: transcript,
    author: Author.You,
  });
  renderHTML();

  const reply = await getReply(replyUrl, state.messages);

  state.messages.push({
    text: reply,
    author: Author.Bot,
  });
  renderHTML();

  // speechSynthesiser.speak(reply);
};

toggleEl.addEventListener('click', () => {
  state.recording = !state.recording;
  state.recording ? start() : stop();
  setToogle(state.recording ? state.stopText : state.playText);
});

function setToogle(text) {
  toggleEl.textContent = text;
}

setToogle(state.playText);

function renderHTML() {
  messagesEl.innerHTML = state.messages
    .map(
      message => `<div class="message ${message.author}">${message.text}</div>`
    )
    .join('');
}

renderHTML();
