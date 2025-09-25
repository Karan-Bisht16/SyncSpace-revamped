import { useSelector } from 'react-redux';
import { validatePassword } from '@syncspace/shared';
// importing mui components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
// importing mui icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing features
import { determineReauth } from '../../user';
// importing types
import type { RootState } from '../../../types';
// importing hooks
import { useSettingModal } from '../hooks/useSettingModal';
import { useDeleteAccount } from '../hooks/useDeleteAccount';
import { useChangePassword } from '../hooks/useChangePassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { SectionCaption, SectionHeading, SectionSubHeading } from './ui/SettingTypography';

export const AccountSetting = () => {
    const changePasswordStatus = useSelector((state: RootState) => state.user.status.changePassword);

    const { openDeleteAccountModal } = useSettingModal();

    const {
        formData,
        formDispatch,
        handleSubmit,
        onChange,
        refs,
        setShowPassword,
        showPassword,
    } = useChangePassword();

    const { currentPassword, newPassword } = formData;
    const { currentPasswordRef, newPasswordRef } = refs;

    const {
        dispatch,
        determineReauthStatus,
    } = useDeleteAccount();

    return (
        <Stack spacing={3}>
            <SectionHeading text='User [need good text]' />

            {/* TODO: should i make use of ABAC for these actions as in auth provider should be email */}
            <Box>
                <SectionSubHeading text='Verify email' />
                <SectionCaption text='verify email [need good text]' />
            </Box>

            <Box>
                <SectionSubHeading text='Update email' />
                <SectionCaption text='Update email [need good text]' />
            </Box>

            <Box>
                <SectionSubHeading text='Change Password' />
                <SectionCaption text='Update password [need good text]' />

                <CenteredBox component='form' onSubmit={handleSubmit} sx={{ flexDirection: 'column', alignItems: 'flex-start', gap: 2 }}>
                    <FormTextField
                        name='currentPassword'
                        label='Current Password'
                        type={showPassword.currentPassword ? 'text' : 'password'}
                        data={currentPassword}
                        submitting={changePasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={currentPasswordRef}
                        dispatch={formDispatch}
                        validate={validatePassword}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment
                                        position='end'
                                        onClick={() => setShowPassword({ ...showPassword, currentPassword: !showPassword.currentPassword })}
                                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                    >
                                        {showPassword.currentPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <FormTextField
                        name='newPassword'
                        label='New Password'
                        type={showPassword.newPassword ? 'text' : 'password'}
                        data={newPassword}
                        submitting={changePasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={newPasswordRef}
                        dispatch={formDispatch}
                        validate={validatePassword}
                        required
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment
                                        position='end'
                                        onClick={() => setShowPassword({ ...showPassword, newPassword: !showPassword.newPassword })}
                                        sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                    >
                                        {showPassword.newPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />

                    <Button
                        type='submit'
                        variant='contained'
                        disabled={changePasswordStatus === 'loading'}
                        color='primary'
                    >
                        Update
                    </Button>
                </CenteredBox>
            </Box>

            <Divider />

            <Box>
                <SectionSubHeading text='Delete Account' />
                <SectionCaption text='Once you delete your account, there is no going back. Please be certain.' />
                <Button variant='contained' color='error' onClick={openDeleteAccountModal}>Delete</Button>
            </Box>

            {/* TODO: either remove this or make it devloper only feature */}
            <Box>
                <SectionSubHeading text='Reauth Status' />
                <Button
                    variant='contained'
                    color={determineReauthStatus === 'failed' ?
                        'error' :
                        (determineReauthStatus === 'succeeded' ? 'success' : 'primary')}
                    onClick={() => dispatch(determineReauth())}
                >
                    Check Reauth
                </Button>
            </Box>
        </Stack>
    );
};