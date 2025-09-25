// importing types;
import type { ReactElement } from 'react';
import type { ButtonProps } from '@mui/material';

export type ModalButton = {
    label: string,
    onClickFunction: () => Promise<boolean> | boolean,
    autoFocus?: boolean,
} & ButtonProps;

type ModalBase = {
    id: ModalType,
    isPersistent?: boolean,
    maxWidth?: string,
    bgcolor?: string,
    unstyled?: boolean,
    modalButtons?: ModalButton[],
};

export type ModalState = ({
    hideTitle: true,
    modalContent: {
        body: string | ReactElement,
    },
    closeButton?: {
        top: string,
        right: string,
    }
} | {

    hideTitle?: false | undefined,
    modalContent: {
        title: string | ReactElement,
        body: string | ReactElement,
    },
}) & ModalBase;

export const ModalTypes = ['auth', 'reauth', 'forgotPassword', 'setting', 'resetSetting', 'deleteAccount'] as const;
export type ModalType = typeof ModalTypes[number];

export type ModalUpdate = {
    id: ModalType;
} & Partial<Omit<ModalState, "id">>;

export type ModalContextType = {
    modals: ModalState[],
    openModal: (data: ModalState) => void,
    editModal: (data: ModalUpdate) => void,
    replaceModal: (data: ModalState) => void,
    closeModal: (_id: ModalType) => void,
};