export default class VolumeAnalyser {
  analyser: any;
  dataArray: any;
  canvasCtx: any;
  audioCtx: any;
  bufferLength: any;
  active: boolean;

  silenceThreshold = 25;
  silenceTimeTreshhold = 2000;

  isSilence: boolean;
  silenceStartTime: number;

  constructor(canvasCtx) {
    this.canvasCtx = canvasCtx;
  }

  initStream = stream => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const distortion = audioCtx.createScriptProcessor(2048, 1, 1);

    analyser.connect(distortion);
    distortion.connect(audioCtx.destination);

    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    analyser.getByteTimeDomainData(dataArray);

    this.analyser = analyser;
    this.dataArray = dataArray;
    this.audioCtx = audioCtx;
    this.bufferLength = bufferLength;
  };

  stop = () => {
    this.active = false;
  };

  start = stream => {
    this.active = true;
    this.initStream(stream);
    this.drawCanvas();
  };

  drawCanvas = () => {
    if (!this.active) {
      return;
    }

    const { analyser, dataArray, canvasCtx, bufferLength } = this;
    const WIDTH = this.canvasCtx.canvas.width;
    const HEIGHT = this.canvasCtx.canvas.height;

    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(200, 200, 200)';
    canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
    canvasCtx.beginPath();

    const barWidth = (WIDTH / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    const array = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(array);
    const arraySum = array.reduce((a, value) => a + value, 0);
    const average = arraySum / array.length;
    const isSilence = average < this.silenceThreshold;

    if (isSilence && !this.isSilence) {
      this.silenceStartTime = Date.now();
      this.isSilence = true;
    }

    for (let i = 0; i < bufferLength; i++) {
      barHeight = dataArray[i] / 2;

      canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',50,50)';
      canvasCtx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);

      x += barWidth + 1;
    }

    requestAnimationFrame(this.drawCanvas);
  };
}
