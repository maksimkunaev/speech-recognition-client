export type Message = {
  text: string;
  author: Author;
};

export enum Author {
  You = 'You',
  Bot = 'Marv',
}
