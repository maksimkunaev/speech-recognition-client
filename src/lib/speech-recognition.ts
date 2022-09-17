import AudioRecorder from './recorder';
import VolumeAnalyser from './audio-visualiser';
import { recognize } from './api/recognize';
import { saveAudio } from './utils/helpers';
import { ResultEvent } from './types';

class SpeechRecognition {
  recorder: AudioRecorder;
  analyser: VolumeAnalyser;
  onspeechend: () => void;
  onerror: (event: any) => void;
  onend: () => void;
  onresult: (event: ResultEvent) => {};
  isStopped = false;

  minVolume: number = 7;

  continuous: boolean;
  lang: 'en-US';
  interimResults: boolean;
  maxAlternatives: number;

  constructor(public url: string, canvas?: HTMLCanvasElement) {
    this.url = url;
    console.log('Custom SpeechRecognition constructor');

    if (canvas) {
      this.analyser = new VolumeAnalyser(canvas.getContext('2d'));
    }

    this.init();
  }

  async init() {
    this.recorder = new AudioRecorder({
      onRecordStart: stream => {
        // console.log('audio: onRecordStart');
        if (this.analyser) this.analyser.start(stream);
      },
      onRecordStop: async chunks => {
        // console.log('audio: onRecordStop');
        if (this.analyser) this.analyser.stop();
        // saveAudio(chunks);
        this.transcript(new Blob(chunks));
      },
    });
  }

  transcript = async (blob: Blob) => {
    const transcript = await recognize(this.url, blob);

    const event: ResultEvent = {
      results: [
        [
          {
            transcript,
          },
        ],
      ],
    };

    if (!this.isStopped) {
      this.onresult(event);
      // this.onspeechend();
      // this.onend();
    }
  };

  start = () => {
    // console.log('recognition: start()');
    this.isStopped = false;

    this.recorder.startRecord();
  };

  stop = () => {
    // console.log('recognition: stop()');
    this.isStopped = true;

    this.recorder.stopRecord();
  };
}

// export default SpeechRecognition;
export default window.SpeechRecognition ||
  window.webkitSpeechRecognition ||
  SpeechRecognition;
