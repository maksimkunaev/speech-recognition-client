import { Message } from './types';

type ReplyResponse = {
  message: string;
  data: string;
};

export const getReply = async (
  url: string,
  messages: Message[],
  testReply?: string
): Promise<string> => {
  if (testReply) {
    return testReply;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ messages }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result: ReplyResponse = (await response.json()) as ReplyResponse;
    if (response.status >= 300) {
      throw new Error(response.statusText);
    }

    return result.data;
  } catch (err) {
    console.error(err);

    return '';
  }
};
