import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import LinearProgress from '@mui/material/LinearProgress';
// importing icons
import CloseIcon from '@mui/icons-material/Close';
// importing types
import type { Breakpoint, SvgIconProps } from '@mui/material';
import type { ModalProps } from '../types';
// importing contexts
import { useModalContext } from '../contexts/modal.context';
// importing components
import { CenteredBox } from './CenteredBox';

// NOTE: DO NOT pass states from component to modal.body component; No re-render will happen for any state change
// Atmost what we can do is make use of context to share data between component and modal.body component
const Modal = (props: ModalProps) => {
    const { modalData, onClose } = props;
    const { id, isPersistent, maxWidth, bgcolor = 'background.paper', unstyled, modalButtons, hideTitle, modalContent } = modalData;
    const { body } = modalContent;

    const title = 'title' in modalContent ? modalContent.title : '';
    const px = unstyled ? 0 : 2;
    const py = unstyled ? 0 : 1.5;

    let top;
    let right;
    if (hideTitle) {
        const { closeButton } = modalData;
        top = closeButton?.top || '32px';
        right = closeButton?.right || '32px';
    }

    const [loading, setLoading] = useState(false);

    // TODO: Add optional onClose guard - Confirm before closing (unsaved changes etc.)
    // To implement above we would need a gaurdString which if present then open another modal with 'OK' and 'CANCEL' button 
    const handleClose = async (onClickFunction?: () => Promise<boolean> | boolean) => {
        if (onClickFunction) {
            setLoading(true);
            const success = await onClickFunction();
            setLoading(false);

            if (success) {
                return onClose(id);
            }
        } else {
            onClose(id);
        }
    };

    const CloseButton = (props: SvgIconProps) => {
        const { sx, ...rest } = props;

        return (
            <CloseIcon
                onClick={() => handleClose()}
                fontSize={hideTitle ? 'large' : 'small'}
                sx={{
                    zIndex: (theme) => theme.zIndex.modal || 130,
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'text.primary' },
                    ...sx
                }}
                {...rest}
            />
        );
    };

    return (
        <Dialog
            open={true}
            onClose={() => { !isPersistent && handleClose() }}
            maxWidth={maxWidth === undefined ? false : maxWidth as Breakpoint}
        >
            <Box sx={{ bgcolor }}>
                {!hideTitle &&
                    <>
                        <CenteredBox sx={{ gap: 4, justifyContent: 'space-between', px, py }}>
                            <>{title}</>

                            {!isPersistent && <CloseButton />}
                        </CenteredBox>

                        {loading ?
                            <LinearProgress />
                            : <Divider sx={{ height: '2px' }} />
                        }
                    </>
                }

                <Box sx={{ position: 'relative', px, py }}>
                    {(!isPersistent && hideTitle) &&
                        <CloseButton sx={{ position: 'absolute', top, right }} />
                    }
                    {body}
                </Box>

                <CenteredBox sx={{ gap: 1, float: 'right', px, py }}>
                    {modalButtons?.map((button, index) => {
                        const { label, onClickFunction, autoFocus = false, ...rest } = button;

                        return (
                            <Button
                                key={index}
                                autoFocus={autoFocus}
                                onClick={() => handleClose(onClickFunction)}
                                disabled={loading}
                                {...rest}
                            >
                                {label}
                            </Button>
                        );
                    })}
                </CenteredBox>
            </Box>
        </Dialog>
    );
};

export const Modals = () => {
    const { modals, closeModal } = useModalContext();

    return modals?.map((modal) => (
        <Modal
            key={modal.id}
            modalData={modal}
            onClose={closeModal}
        />
    ));
};