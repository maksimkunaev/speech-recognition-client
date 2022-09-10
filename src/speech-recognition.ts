import AudioRecorder from './recorder';
import VolumeAnalyser from './audio-visualiser';
import { recognize } from './api/recognize';
import { saveAudio } from './utils/helpers';

const canvas = <HTMLCanvasElement>document.querySelector('.volume-analyser');

class SpeechRecognition {
  recorder: AudioRecorder;
  analyser: VolumeAnalyser;
  onspeechend: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  minVolume: number = 7;

  continuous: boolean;
  lang: 'en-US';
  interimResults: boolean;
  maxAlternatives: number;

  constructor(public url: string) {
    this.url = url;
    this.analyser = new VolumeAnalyser(canvas.getContext('2d'));

    this.init();
  }

  async init() {
    this.recorder = new AudioRecorder({
      onRecordStart: stream => {
        this.analyser.start(stream);
      },
      onSpeechEnd: () => {
        this.recorder.stopRecord();
      },
      onRecordStop: async chunks => {
        this.analyser.stop();
        // saveAudio(chunks);

        this.onRecognize(new Blob(chunks));
        this.onspeechend();
        this.onend();
      },
    });
  }

  onRecognize = async (blob: Blob) => {
    const transcript = await recognize(this.url, blob);
    const event = {
      results: [
        [
          {
            transcript,
          },
        ],
      ],
    };

    this.onresult(event);
  };

  start = () => {
    this.recorder.startRecord();
  };

  onresult = transcript => {};

  stop = () => {
    this.recorder.stopRecord();
  };
}

export default window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  SpeechRecognition;
