import { useDispatch } from 'react-redux';
// importing features
import { deleteAccount, resetSetting } from '../../user';
// importing types
import type { AppDispatch } from '../../../types';
// importing contexts
import { useModalContext } from '../../../contexts/modal.context';
// importing components
import { SettingModal } from '../components/SettingModal';

export const useSettingModal = () => {
    const dispatch = useDispatch<AppDispatch>();

    const { openModal, closeModal } = useModalContext();

    const openSettingModal = () => {
        openModal({
            id: 'setting',
            hideTitle: true,
            modalContent: {
                body: <SettingModal />
            },
            closeButton: { top: '16px', right: '16px' },
            unstyled: true,
        });
    };

    const closeSettingModal = () => {
        closeModal('setting');
    };

    const openResetSettingModal = () => {
        openModal({
            id: 'resetSetting',
            isPersistent: true,
            modalContent: {
                title: 'Reset Settings',
                body:
                    <>
                        Are you sure you want to reset all settings to their default values?
                        <br /><br />
                        This action cannot be undone.
                    </>
            },
            modalButtons: [
                {
                    label: 'Cancel',
                    variant: 'outlined',
                    autoFocus: true,
                    onClickFunction: () => { return true; },
                },
                {
                    label: 'Reset',
                    color: 'primary',
                    variant: 'contained',
                    onClickFunction: () => {
                        dispatch(resetSetting());
                        return false;
                    },
                },
            ],
            maxWidth: 'sm'
        });
    };

    const closeResetSettingModal = () => {
        closeModal('resetSetting');
    };

    const openDeleteAccountModal = () => {
        openModal({
            id: 'deleteAccount',
            isPersistent: true,
            modalContent: {
                title: 'Delete Account',
                body:
                    <>
                        This action is irreversible. Once deleted, you will not be able to create a new profile with the same name (i.e., e/me). If you intend to delete this profile only to recreate it, please consider using the 'Edit Profile' option instead.
                        <br /><br />
                        Are you sure you want to proceed?`,
                    </>
            },
            modalButtons: [
                {
                    label: 'Cancel',
                    variant: 'outlined',
                    autoFocus: true,
                    onClickFunction: () => { return true; },
                },
                {
                    label: 'Delete',
                    color: 'error',
                    variant: 'contained',
                    onClickFunction: () => {
                        dispatch(deleteAccount());
                        return false;
                    },
                },
            ],
            maxWidth: 'sm'
        });
    };

    const closeDeleteAccountModal = () => {
        closeModal('deleteAccount');
    };

    return {
        openSettingModal,
        closeSettingModal,
        openDeleteAccountModal,
        closeDeleteAccountModal,
        openResetSettingModal,
        closeResetSettingModal,
    };
};