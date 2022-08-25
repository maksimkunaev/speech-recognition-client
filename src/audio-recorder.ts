import {
  MediaRecorder,
  IMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';

export default class Recorder {
  recorder: IMediaRecorder;
  audioChunks = [];
  onRecordStart: (stream: any) => void;
  onRecordStop: (blob: Blob) => void;

  constructor({ onRecordStart, onRecordStop }) {
    this.init();
    this.onRecordStart = onRecordStart;
    this.onRecordStop = onRecordStop;
  }

  init = async () => {
    await register(await connect());
  };

  start = () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(stream => {
        this.onRecordStart(stream);

        this.recorder = new MediaRecorder(stream, {
          mimeType: 'audio/wav',
        });

        this.recorder.ondataavailable = e => {
          this.audioChunks.push(e.data);
        };
        this.recorder.onstop = this.onStop;
        this.recorder.start();
      })
      .catch(console.log);
  };

  onStop = async () => {
    const blob = new Blob(this.audioChunks, { type: 'audio/wav' });
    this.audioChunks = [];

    this.onRecordStop(blob);
  };

  stop = () => {
    this.recorder.stop();
  };
}
