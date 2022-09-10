export default class SpeechSynthesiser {
  synth: any;

  constructor() {
    const synth = window.speechSynthesis;
    this.synth = synth;
  }

  speak(text: string) {
    const utterThis = new SpeechSynthesisUtterance(text);
    const voice = getVoice(this.synth, 'Alex');

    utterThis.voice = voice;
    this.synth.speak(utterThis);
  }
}

function getVoice(synth, name) {
  const voice = synth.getVoices().find(voice => voice.name === name);

  return voice;
}
