import { useSelector } from 'react-redux';
import { validatePassword } from '@syncspace/shared';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { RootState } from '../../../types';
// importing hooks
import { useReauth } from '../hooks/useReauth';
import { useReauthModal } from '../hooks/useReauthModal';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { GenericAuthModal } from '../../../components/GenericAuthModal';

export const ReauthModal = () => {
    const reauthStatus = useSelector((state: RootState) => state.user.status.reauth);

    const {
        formData,
        formDispatch,
        onChange,
        passwordRef,
        showPassword,
        setShowPassword,
        handleReauth,
    } = useReauth();
    const { closeReauthModal } = useReauthModal();

    const { password } = formData;

    return (
        <GenericAuthModal
            heading='Reauth'
            subHeading='Enter your password to continue'
            lordicon={{ src: 'https://cdn.lordicon.com/dicvhxpz.json' }}
        >
            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                onSubmit={handleReauth}
            >
                <FormTextField
                    name='password'
                    label='Password'
                    type={showPassword ? 'text' : 'password'}
                    data={password}
                    submitting={reauthStatus === 'loading'}
                    onChange={onChange}
                    inputRef={passwordRef}
                    dispatch={formDispatch}
                    validate={validatePassword}
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

                <CenteredBox sx={{ gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                    <Button variant='outlined' onClick={closeReauthModal}>Cancel</Button>
                    <Button type='submit' variant='contained'>Ok</Button>
                </CenteredBox>
            </CenteredBox>
        </GenericAuthModal>
    );
};