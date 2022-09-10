import { getReply } from './get-reply';
import SpeechRecognition from '../lib/speech-recognition';
import SpeechSynthesiser from './speech-synthesis';
import { Author, Message } from './types';

const messagesEl = <HTMLElement>document.querySelector('.messages');
const toggleEl = <HTMLElement>document.querySelector('.toggle');

const recognizeUrl = '/transcript';
const replyUrl = '/gpt';
const canvas = <HTMLCanvasElement>document.querySelector('.volume-analyser');

const recognition = new SpeechRecognition(recognizeUrl, canvas);
const speechSynthesiser = new SpeechSynthesiser();

recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

type State = {
  recording: boolean;
  stopText: string;
  playText: string;
  messages: Message[];
  isStopped: boolean;
};

const state: State = {
  recording: false,
  stopText: '⏹️',
  playText: '🎙️',
  messages: [],
  isStopped: false,
};

const start = async () => {
  recognition.start();
  console.log('start----->');

  toggleEl.classList.add('animate');
  setToogle(state.stopText);
  state.isStopped = false;
};

const stop = () => {
  recognition.stop();
  toggleEl.classList.remove('animate');
  setToogle(state.playText);
  state.isStopped = true;
  console.log('stop----->');
};

recognition.onspeechend = () => {
  recognition.stop();
  console.log('stop----->');
};

recognition.onerror = event => {
  console.log(`Error occurred in recognition: ${event.error}`);
};

recognition.onend = () => {
  if (state.isStopped) {
    return;
  }

  // console.log('start after onend', state.isStopped);
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

  const reply = await getReply(
    replyUrl,
    state.messages
    // "I'm old enough to know better, but young enough to still do it anyway."
  );

  state.messages.push({
    text: reply,
    author: Author.Bot,
    isBot: true,
  });
  renderHTML();

  // stop();
  // speechSynthesiser.speak(reply);
  // speechSynthesiser.onend = () => {
  //   start();
  //   // console.log('start after speech end', recognition);
  // };
};

toggleEl.addEventListener('click', () => {
  state.recording = !state.recording;
  state.recording ? start() : stop();
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
