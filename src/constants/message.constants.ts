export const MessageStatus = {
  PENDING: 'PENDING',
  SENT: 'SENT',
  FAILED: 'FAILED',
} as const;

export type MessageStatusType = typeof MessageStatus[keyof typeof MessageStatus];

export const MessageType = {
  BIRTHDAY: 'BIRTHDAY',
  ANNIVERSARY: 'ANNIVERSARY',
} as const;

export type MessageTypeType = typeof MessageType[keyof typeof MessageType];
