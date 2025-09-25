export type AuthMode = 'login' | 'register';

export type AuthModalProps = {
    authMode: AuthMode,
    fullPage?: boolean, 
};