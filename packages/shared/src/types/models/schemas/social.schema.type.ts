export const SocialTypes = [
    'Custom',
    'SyncSpace',
    'Reddit',
    'Twitter',
    'Instagram',
    'Facebook',
    'LinkedIn',
    'TikTok',
    'Youtube',
] as const;
export type SocialType = typeof SocialTypes[number];

export type SocialSchema = {
    displayText: string
    url: string,
    type: SocialType,
};