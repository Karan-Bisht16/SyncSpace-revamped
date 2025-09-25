import { useEffect } from 'react';
import { validateProfilePic } from '@syncspace/shared';
import Avatar from '@mui/material/Avatar';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
// importing icons
import ValidIcon from '@mui/icons-material/Check';
import InvalidIcon from '@mui/icons-material/Close';
// importing types 
import type { RegisterProfileFormProps } from '../types';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FileUploader } from '../../../components/FileUploader';
import { FormTextField } from '../../../components/FormTextField';

export const RegisterProfileForm = (props: RegisterProfileFormProps) => {
    const {
        username,
        profilePic,
        usernameRef,
        onChange,
        formDispatch,
        fileDispatch,
        usernameAvailability,
        validateUsernameAvailability,
        submitting,
    } = props;

    const isMobile = useMobile();

    useEffect(() => {
        if (!isMobile) {
            usernameRef.current?.focus();
        }
    }, [isMobile]);

    return (
        <>
            <CenteredBox sx={{ flexDirection: 'column', width: '100%' }}>
                <Typography variant='body1'>
                    Profile Picture
                </Typography>

                <FileUploader
                    name='profilePic'
                    data={profilePic}
                    submitting={submitting}
                    dispatch={fileDispatch}
                    validate={validateProfilePic}
                    accept='image/*'
                    uploadIcon={<Avatar sx={{ height: 96, width: 96 }} />}
                    size={100}
                    sx={{
                        border: '3px solid',
                        borderColor: 'primary.main',
                        borderRadius: '50%',
                        '&:hover': {
                            borderColor: 'primary.dark',
                            '& .upload-overlay': { opacity: 1 },
                        },
                    }}
                />
            </CenteredBox>

            {/* TODO: Add text regarding 'username cannot be changed later' */}
            <FormTextField
                name='username'
                label='Username'
                data={username}
                onChange={onChange}
                submitting={submitting}
                inputRef={usernameRef}
                dispatch={formDispatch}
                validate={validateUsernameAvailability}
                required
                slotProps={{
                    input: {
                        endAdornment: (
                            usernameAvailability !== undefined &&
                            <InputAdornment
                                position='end'
                                sx={{ color: usernameAvailability ? 'success.main' : 'error.main' }}
                            >
                                {usernameAvailability ? <ValidIcon fontSize='small' /> : <InvalidIcon fontSize='small' />}
                            </InputAdornment>
                        ),
                    },
                }}
            />
        </>
    );
};