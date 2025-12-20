export const TokenActions = ['resetPassword', 'updateEmail', 'verifyEmail'] as const;
export type TokenAction = typeof TokenActions[number];