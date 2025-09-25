import { createContext, useContext, useState } from 'react';
import { isArray, validate } from '@syncspace/shared'
// importing types;
import type {
    ContextProviderProps,
    ModalContextType,
    ModalState,
    ModalType,
    ModalUpdate,
} from '../types';

// FIXME: Modals take way too long to open
const ModalContext = createContext<ModalContextType>({
    modals: [] as ModalState[],
    openModal: (_data: ModalState) => { },
    editModal: (_data: any) => { },
    replaceModal: (_data: ModalState) => { },
    closeModal: (_id: ModalType) => { },
});
export const useModalContext = () => useContext(ModalContext);

export const ModalProvider = (props: ContextProviderProps) => {
    const { children } = props;

    const [modals, setModals] = useState<ModalState[]>([]);

    const openModal = (data: ModalState) => {
        setModals((prevModals) => {
            if (!prevModals) {
                prevModals = [];
            }

            return [...prevModals, data];
        });
    };

    const editModal = (data: ModalUpdate) => {
        const { id } = data;
        setModals((prevModals) => {
            return prevModals?.map((modal) => {
                if (modal.id === id) {
                    return { ...modal, ...data } as ModalState;
                } else {
                    return modal;
                }
            });
        });
    };

    const replaceModal = (data: ModalState) => {
        const { id } = data;
        setModals((prevModals) => {
            return prevModals?.map((modal) => {
                if (modal.id === id) {
                    return data;
                } else {
                    return modal;
                }
            });
        });
    };

    const closeModal = async (id: ModalType) => {
        setModals((prevModals) => {
            if (!validate(prevModals, isArray, 'closeModal.prevModals')) {
                return [];
            }
            if (prevModals.length === 0) {
                return [];
            }

            return prevModals?.filter((modal) => modal.id !== id)
        });
    };

    return (
        <ModalContext.Provider
            value={{
                modals,
                openModal,
                editModal,
                replaceModal,
                closeModal,
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};