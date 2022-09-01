import AudioRecorder from './audio-recorder';
import VolumeAnalyser from './audio-analyser';
import { recognize } from './api/recogize';

const canvas = <HTMLCanvasElement>document.querySelector('.volume-analyser');

export default class SpeechRecognition {
  recorder: AudioRecorder;
  analyser: VolumeAnalyser;
  onspeechend: () => void;

  constructor(public url: string) {
    this.url = url;
    this.analyser = new VolumeAnalyser(
      canvas.getContext('2d'),
      this._onspeechend
    );

    this.recorder = new AudioRecorder({
      onRecordStart: stream => {
        this.analyser.start(stream);
      },
      onRecordStop: async blob => {
        this.analyser.stop();
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
      },
    });
  }

  start = () => {
    this.recorder.start();
  };

  onresult = transcript => {};

  _onspeechend = () => {
    this.recorder.stop();
    this.onspeechend();
  };

  stop = () => {
    this.recorder.stop();
  };
}

// window.SpeechRecognition || webkitSpeechRecognition || SpeechRecognition;
