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

  minVolume: number = 7;

  continuous: boolean;
  lang: 'en-US';
  interimResults: boolean;
  maxAlternatives: number;

  constructor(public url: string, canvas?: HTMLCanvasElement) {
    this.url = url;

    if (canvas) {
      this.analyser = new VolumeAnalyser(canvas.getContext('2d'));
    }

    this.init();
  }

  async init() {
    this.recorder = new AudioRecorder({
      onRecordStart: stream => {
        if (this.analyser) this.analyser.start(stream);
      },
      onSpeechEnd: () => {
        this.recorder.stopRecord();
      },
      onRecordStop: async chunks => {
        if (this.analyser) this.analyser.stop();
        // saveAudio(chunks);

        this.onRecognize(new Blob(chunks));
        this.onspeechend();
        this.onend();
      },
    });
  }

  onRecognize = async (blob: Blob) => {
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

    this.onresult(event);
  };

  start = () => {
    this.recorder.startRecord();
  };

  stop = () => {
    this.recorder.stopRecord();
  };
}

export default SpeechRecognition;

// export default window.SpeechRecognition ||
//   window.webkitSpeechRecognition ||
//   SpeechRecognition;
