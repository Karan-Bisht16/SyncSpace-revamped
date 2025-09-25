// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { ReauthModal } from '../component/ReauthModal';

export const useReauthModal = () => {
    const { openModal, closeModal } = useModalContext();

    const openReauthModal = () => {
        openModal({
            id: 'reauth',
            isPersistent: true,
            hideTitle: true,
            modalContent: {
                body: <ReauthModal />
            },
            unstyled: true,
        });
    };


    const closeReauthModal = () => {
        closeModal('reauth');
    };

    return {
        openReauthModal,
        closeReauthModal,
    };
};