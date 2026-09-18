export type SendResult = {
  success: boolean;
  message?: string;
};

export interface MessageQueue {
  send(message: unknown): Promise<SendResult>;
}