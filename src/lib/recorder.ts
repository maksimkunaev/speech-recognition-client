import {
  MediaRecorder,
  IMediaRecorder,
  register,
} from 'extendable-media-recorder';
import { connect } from 'extendable-media-recorder-wav-encoder';
import { VolumeDetector } from './utils/helpers';

export default class AudioRecorder {
  stream: any;
  chunks = [];
  mediaRecorder: IMediaRecorder;
  onRecordStop: (chunks: Blob[]) => void;
  onRecordStart: (stream: any) => void;
  isSpeaking = false;
  volumeDetector: VolumeDetector;

  constructor({ onRecordStop, onRecordStart }) {
    this.init();
    this.onRecordStop = onRecordStop;
    this.onRecordStart = onRecordStart;
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
            this.onRecordStop(this.chunks);
            this.chunks = [];
          };

          this.stream = stream;

          const onSpeechStart = () => {
            // console.log('recorder: onSpeechStart()');
            this.isSpeaking = true;
          };

          const onVoidDetected = () => {
            // console.log('recorder: onVoidDetected()');
            this.stopRecord();
            this.isSpeaking = false;
          };

          this.volumeDetector = new VolumeDetector(
            stream,
            onSpeechStart,
            onVoidDetected
          );

          this.mediaRecorder.ondataavailable = e => {
            if (this.isSpeaking || this.chunks.length === 0) {
              this.chunks.push(e.data);
            }
          };
        })
        .catch(err => {
          console.error(`The following error occurred: ${err}`);
        });
    }
  };

  startRecord() {
    // console.log('recorder: startRecord()');
    this.mediaRecorder.start(1000);
    this.onRecordStart(this.stream);
    this.volumeDetector.start();
  }

  stopRecord() {
    // console.log('recorder: stopRecord()');
    this.mediaRecorder.stop();
    this.volumeDetector.stop();
  }
}
