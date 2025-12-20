import { useSelector } from 'react-redux';
import { validateNewPassword } from '@syncspace/shared';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { ResetPasswordFormProps } from '../types';
import type { RootState } from '../../../types';
// importing hooks
import { useResetPassword } from '../hooks/useResetPassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { GenericAuthModal } from '../../../components/GenericAuthModal';
import { FormTextField } from '../../../components/FormTextField';

export const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const { token } = props;

    const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);

    const {
        formData,
        formDispatch,
        onChange,
        newPasswordRef,
        showPassword,
        setShowPassword,
        handleResetPassword,
    } = useResetPassword(token);

    const { newPassword } = formData;

    return (
        <GenericAuthModal
            heading="Reset Password"
            lordicon={{ src: 'https://cdn.lordicon.com/dicvhxpz.json' }}
            subHeading="Enter a new password to reset your account."
            sx={{ p: 4, bgcolor: 'background.default' }}
        >
            <CenteredBox
                component="form"
                sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                onSubmit={handleResetPassword}
            >
                <FormTextField
                    name="newPassword"
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    data={newPassword}
                    submitting={resetPasswordStatus === 'loading'}
                    onChange={onChange}
                    inputRef={newPasswordRef}
                    dispatch={formDispatch}
                    validate={validateNewPassword}
                    required
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment
                                    position='end'
                                    onClick={() => setShowPassword(!showPassword)}
                                    sx={{ color: 'text.disabled', cursor: 'pointer' }}
                                >
                                    {showPassword ? <HidePasswordIcon /> : <ShowPasswordIcon />}
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                <Button
                    type='submit'
                    variant='contained'
                    disabled={resetPasswordStatus === 'loading'}
                    fullWidth
                    color='primary'
                >
                    Reset Password
                </Button>
            </CenteredBox>
        </GenericAuthModal>
    );
};
