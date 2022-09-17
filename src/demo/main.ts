import { getReply } from './get-reply';
import SpeechRecognition from '../lib/speech-recognition';
import SpeechSynthesiser from './speech-synthesis';
import { Author, Message } from './types';

const messagesEl = <HTMLElement>document.querySelector('.messages');
const startEl = <HTMLElement>document.querySelector('.start');
const stopEl = <HTMLElement>document.querySelector('.stop');
const statusEl = <HTMLElement>document.querySelector('.status');

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
  isStoppedByUser: boolean;
  lastStartedAt: number;
  timer?: number;
  messages: Message[];
};

const state: State = {
  lastStartedAt: 0,
  isStoppedByUser: false,
  messages: [],
};

// recognition.onspeechend = () => {
//   // console.log('onspeechend ---->');
// };

// recognition.onend = () => {
//   // stopRecognition('onend');
//   // restartRecognition('onend');
// };

recognition.onresult = async event => {
  const transcript = event.results[0][0].transcript;

  state.messages.push({
    text: transcript,
    author: Author.You,
  });
  renderHTML();

  const reply = await getReply(
    replyUrl,
    state.messages
    // "I'm old enough to know better" + ' ' + Math.round(Math.random() * 100)
  );

  // console.log('onresult speak: ', { transcript, reply });

  if (transcript && reply) {
    state.messages.push({
      text: reply,
      author: Author.Bot,
      isBot: true,
    });
    renderHTML();
    // stopRecognition('before speak');

    speechSynthesiser.speak(reply);
    // console.log('onresult speak: ', { transcript, reply });

    speechSynthesiser.onend = () => {
      restartRecognition('after specking');
    };
  } else {
    // state.isStoppedByUser = false;
    // console.log('onresult ----: ');
    restartRecognition('after empty transcript');
  }
};

recognition.onerror = event => {
  console.log('error', event);
};

startEl.addEventListener('click', () => {
  startRecognition('start button');

  state.isStoppedByUser = false;
});

stopEl.addEventListener('click', () => {
  stopRecognition('stop button');

  state.isStoppedByUser = true;
});

function startRecognition(arg) {
  try {
    recognition.start();
    // console.log('start ---->: ', arg);

    state.lastStartedAt = Date.now();
    statusEl.innerHTML = 'Listening...';
  } catch (err) {
    console.log('start error', err);
  }
}

function restartRecognition(arg) {
  if (state.isStoppedByUser) {
    return;
  }

  let timeSinceLastStart = Date.now() - state.lastStartedAt;

  if (timeSinceLastStart < 1000) {
    clearTimeout(state.timer);
    state.timer = window.setTimeout(
      () => startRecognition(arg),
      1000 - timeSinceLastStart
    );
  } else {
    startRecognition(arg);
  }
}

function stopRecognition(arg) {
  try {
    recognition.stop();
    // console.log('stop ---->', arg);

    statusEl.innerHTML = 'Stopped';
  } catch (err) {
    console.log('stop error', err);
  }
}

function renderHTML() {
  messagesEl.innerHTML = state.messages
    .map(
      message => `<div class="message ${message.author}">${message.text}</div>`
    )
    .join('');
}
