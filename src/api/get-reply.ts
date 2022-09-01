type ReplyResponse = {
  message: string;
  data: { text: string };
};

export const getReply = async (url: string, input: string) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ input }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const result: ReplyResponse = (await response.json()) as ReplyResponse;
    if (response.status >= 300) {
      throw new Error(response.statusText);
    }

    return result.data.text;
  } catch (err) {
    throw err;
  }
};
