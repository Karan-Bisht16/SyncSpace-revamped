// importing types
import type { AuthMode } from '../types';
// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { AuthModal } from '../components/AuthModal';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';

export const useAuthModal = () => {
    const { openModal, closeModal } = useModalContext();

    const openAuthModal = (authMode: AuthMode) => {
        openModal({
            id: 'auth',
            hideTitle: true,
            modalContent: {
                body: <AuthModal authMode={authMode} />
            },
            unstyled: true,
        });
    };

    const closeAuthModal = () => {
        closeModal('auth');
    };

    const openForgotPasswordModal = () => {
        openModal({
            id: 'forgotPassword',
            isPersistent: true,
            hideTitle: true,
            modalContent: {
                body: <ForgotPasswordModal />
            },
            unstyled: true,
        });
    };

    const closeForgotPasswordModal = () => {
        closeModal('forgotPassword');
    };

    return {
        openAuthModal,
        closeAuthModal,
        openForgotPasswordModal,
        closeForgotPasswordModal,
    };
};