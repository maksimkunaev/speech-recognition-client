import AudioRecorder from './audio-recorder';
import VolumeAnalyser from './audio-analyser';
import SpeechRecognition from './speech-recognition';

const audioEL = <HTMLAudioElement>document.querySelector('audio');
const statusEl = <HTMLElement>document.querySelector('.status');
const canvas = <HTMLCanvasElement>document.querySelector('.volume-analyser');
const recordEl = <HTMLElement>document.querySelector('.record');
const stopEl = <HTMLElement>document.querySelector('.stop');
const recognizer = new SpeechRecognition('/api/transcript');
const analyser = new VolumeAnalyser(canvas.getContext('2d'));

const recorder = new AudioRecorder({
  onRecordStart: stream => {
    statusEl.classList.add('active');
    analyser.start(stream);
  },
  onRecordStop: blob => {
    statusEl.classList.remove('active');
    const src = URL.createObjectURL(blob);
    audioEL.src = src;
    analyser.stop();

    recognizer.recognize(blob);
  },
});

recordEl.addEventListener('click', recorder.start);
stopEl.addEventListener('click', recorder.stop);
