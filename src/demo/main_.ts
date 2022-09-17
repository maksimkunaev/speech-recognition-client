// import { getReply } from './get-reply';
// import SpeechRecognition from '../lib/speech-recognition';
// import SpeechSynthesiser from './speech-synthesis';
// import { Author, Message } from './types';

// const messagesEl = <HTMLElement>document.querySelector('.messages');
// const toggleEl = <HTMLElement>document.querySelector('.toggle');
// const testEl = <HTMLElement>document.querySelector('.test');

// const recognizeUrl = '/transcript';
// const replyUrl = '/gpt';
// const canvas = <HTMLCanvasElement>document.querySelector('.volume-analyser');

// const recognition = new SpeechRecognition(recognizeUrl, canvas);
// const speechSynthesiser = new SpeechSynthesiser();

// recognition.continuous = false;
// recognition.lang = 'en-US';
// recognition.interimResults = false;
// recognition.maxAlternatives = 1;

// testEl.addEventListener('click', () => {
//   console.log(state, recognition.recorder.mediaRecorder.state);
// });

// type State = {
//   recording: boolean;
//   stopText: string;
//   playText: string;
//   messages: Message[];
//   isStopped: boolean;
//   timer?: number;
// };

// const state: State = {
//   recording: false,
//   stopText: '⏹️',
//   playText: '🎙️',
//   messages: [],
//   isStopped: false,
//   // timer: undefined,
// };

// const startRecognition = async () => {
//   if (isRecording()) return;

//   clearTimeout(state.timer);

//   try {
//     console.log('start 1', state.isStopped);
//     recognition.start();
//     toggleEl.classList.add('animate');
//     setToogle(state.stopText);

//     console.log('start 2');
//   } catch (err) {
//     console.log(err);
//   }
// };

// const stopRecognition = () => {
//   if (!isRecording()) return;

//   clearTimeout(state.timer);

//   try {
//     console.log('stop 1');
//     recognition.stop();
//     console.log('stop 2');
//     toggleEl.classList.remove('animate');
//     setToogle(state.playText);
//   } catch (err) {
//     console.log(err);
//   }
// };

// recognition.onspeechend = () => {
//   console.log('onspeechend');
//   // recognition.stop();
// };

// recognition.onerror = event => {
//   console.log(`Error occurred in recognition: ${event.error}`);
// };

// recognition.onend = () => {
//   console.log('onend');
//   stopRecognition();

//   state.timer = window.setTimeout(() => {
//     startRecognition();
//     console.log('from onend timeout');
//   }, 400);
// };

// recognition.onresult = async event => {
//   if (state.isStopped) return;
//   console.log('onresult 1');

//   const { transcript } = event.results[0][0];

//   if (transcript === '') {
//     return;
//   }
//   console.log('onresult 2');

//   state.messages.push({
//     text: transcript,
//     author: Author.You,
//   });
//   renderHTML();

//   const reply = await getReply(
//     replyUrl,
//     state.messages
//     // "I'm old enough to know better, but young enough to still do it anyway."
//   );

//   state.messages.push({
//     text: reply,
//     author: Author.Bot,
//     isBot: true,
//   });
//   renderHTML();

//   // {
//   //   stopRecognition();
//   //   console.log('--> speech');

//   //   speechSynthesiser.speak(reply);
//   //   speechSynthesiser.onend = () => {
//   //     // if (state.isStopped) return;

//   //     // setTimeout(startRecognition, 0);
//   //     console.log('onend speech');
//   //     console.log('\n');
//   //   };
//   // }
//   console.log('\n');
// };

// function toggle() {
//   if (isRecording()) {
//     state.isStopped = true;
//     stopRecognition();
//   } else {
//     state.isStopped = false;
//     startRecognition();
//   }
// }

// toggleEl.addEventListener('click', toggle);

// function setToogle(text) {
//   toggleEl.textContent = text;
// }

// setToogle(state.playText);

// function isRecording() {
//   return recognition.recorder.mediaRecorder.state === 'recording';
// }
// function renderHTML() {
//   messagesEl.innerHTML = state.messages
//     .map(
//       message => `<div class="message ${message.author}">${message.text}</div>`
//     )
//     .join('');
// }

// renderHTML();
