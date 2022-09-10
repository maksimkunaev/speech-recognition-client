import {
  MediaRecorder,
  IMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { CheckVolume } from './utils/helpers';

export default class AudioRecorder {
  stream: any;
  chunks = [];
  mediaRecorder: IMediaRecorder;
  onRecordStop: (chunks: Blob[]) => void;
  onRecordStart: (stream: any) => void;
  onSpeechEnd: (stream: any) => void;

  isSpeaking = false;

  constructor({ onRecordStop, onRecordStart, onSpeechEnd }) {
    this.init();
    this.onRecordStop = onRecordStop;
    this.onRecordStart = onRecordStart;
    this.onSpeechEnd = onSpeechEnd;
  }

  init = async () => {
    await register(await connect());

    if (navigator.mediaDevices) {
      const constraints = { audio: true };

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(stream => {
          this.mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'audio/wav',
          });

          this.mediaRecorder.onstop = e => {
            this.onStop();
          };

          this.stream = stream;

          const onSpeechStart = () => {
            this.isSpeaking = true;
          };

          const onSpeechEnd = () => {
            this.stopRecord();
            this.isSpeaking = false;
          };

          new CheckVolume(stream, onSpeechStart, onSpeechEnd);

          this.mediaRecorder.ondataavailable = e => {
            if (this.isSpeaking || this.chunks.length === 0) {
              this.chunks.push(e.data);
              console.log('ondataavailable add', e.data);
            } else {
              console.log('ondataavailable skip -- ', e.data);
            }
          };
        })
        .catch(err => {
          console.error(`The following error occurred: ${err}`);
        });
    }
  };

  startRecord() {
    this.mediaRecorder.start(1000);
    this.onRecordStart(this.stream);
  }

  stopRecord() {
    this.mediaRecorder.stop();
  }

  private onStop() {
    this.onRecordStop(this.chunks);
    this.chunks = [];
  }
}
