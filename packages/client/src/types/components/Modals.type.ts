// importing types
import type { ModalState, ModalType } from '../contexts/modal.context.type';

export type ModalProps = {
    modalData: ModalState,
    onClose: (_id: ModalType) => void,
};