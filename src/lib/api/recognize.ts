type Transcript = {
  transcription: string;
};

type TranscriptResponse = {
  message: string;
  data: { transcript: Transcript[] };
};

export const recognize = async (url: string, blob: Blob) => {
  try {
    const formData = new FormData();
    formData.append('sample', blob, 'filename.wav');

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const result: TranscriptResponse =
      (await response.json()) as TranscriptResponse;
    if (response.status >= 300) {
      throw new Error(response.statusText);
    }

    return result.data.transcript[0].transcription;
  } catch (err) {
    console.error(err);
  }
};
