const transcriptEl = <HTMLElement>document.querySelector('.transcript');

type Transcript = {
  transcription: string;
};

type TranscriptResponse = {
  message: string;
  transcript: Transcript[];
};
//
// export const getTranscript = async ({ blob }) => {
//   try {
//     const formData = new FormData();
//     formData.append('sample', blob, 'filename.wav');

//     const response = await fetch('/api/transcript', {
//       method: 'POST',
//       body: formData,
//     });

//     const result: TranscriptResponse =
//       (await response.json()) as TranscriptResponse;

//     if (response.status >= 300) {
//       throw new Error(response.statusText);
//     }

//     const { transcription } = result.transcript[0];
//     showTranscript(transcription);

//     return transcription;
//   } catch (err) {
//     throw err;
//   }
// };

// export function showTranscript(transcript) {
//   const p = document.createElement('p');
//   p.textContent = transcript;
//   transcriptEl.appendChild(p);
// }

export default class SpeechRecognition {
  constructor(public url: string) {
    this.url = url;
  }

  recognize = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('sample', blob, 'filename.wav');
      const response = await fetch(this.url, {
        method: 'POST',
        body: formData,
      });
      const result: TranscriptResponse =
        (await response.json()) as TranscriptResponse;
      if (response.status >= 300) {
        throw new Error(response.statusText);
      }
      const { transcription } = result.transcript[0];
      // showTranscript(transcription);
      return transcription;
    } catch (err) {
      throw err;
    }
  };
}
