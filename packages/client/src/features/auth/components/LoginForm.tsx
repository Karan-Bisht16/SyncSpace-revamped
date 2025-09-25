import { useSelector } from 'react-redux';
import { validateEmail, validatePassword } from '@syncspace/shared';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
// importing icons
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
// importing types
import type { RootState } from '../../../types';
import type { LoginFormProps } from '../types';
// impoting hooks
import { useAuthModal } from '../hooks/useAuthModal';
import { useLoginForm } from '../hooks/useLogin';
// impoting components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { AuthFooter } from './ui/AuthFooter';
import { AuthHeader } from './ui/AuthHeader';
import { SubmitButton } from './ui/SubmitButton';

export const LoginForm = (props: LoginFormProps) => {
    const { toggleAuthModal } = props;

    const loginStatus = useSelector((state: RootState) => state.user.status.login);

    const {
        formData,
        formDispatch,
        onChange,
        refs,
        showPassword,
        setShowPassword,
        handleSubmit,
    } = useLoginForm();

    const { openForgotPasswordModal } = useAuthModal();

    const { email, password } = formData;
    const { emailRef, passwordRef } = refs;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 2, alignSelf: 'center', width: '100%' }}>
            <AuthHeader
                lordIcon={{ src: 'https://cdn.lordicon.com/urswgamh.json' }}
                heading='Welcome Back'
                subHeading='Sign in to your account to continue'
            />

            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', width: '100%' }}
                onSubmit={handleSubmit}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 2.75, width: '100%' }}>
                    <FormTextField
                        name='email'
                        label='Email'
                        data={email}
                        submitting={loginStatus === 'loading'}
                        onChange={onChange}
                        inputRef={emailRef}
                        dispatch={formDispatch}
                        validate={validateEmail}
                        required
                    />

                    <FormTextField
                        name='password'
                        label='Password'
                        type={showPassword ? 'text' : 'password'}
                        data={password}
                        submitting={loginStatus === 'loading'}
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
                </CenteredBox>

                <SubmitButton
                    label='Log In'
                    submitting={loginStatus === 'loading'}
                />

                <AuthFooter authMode='login' toggleAuthModal={toggleAuthModal} />

                <Typography
                    component='span'
                    variant='caption'
                    color='primary'
                    onClick={openForgotPasswordModal}
                    sx={{
                        mt: 2,
                        cursor: 'pointer',
                        fontWeight: 'medium',
                        '&:hover': { color: 'primary.dark' },
                    }}
                >
                    Forgot Password?
                </Typography>
            </CenteredBox>
        </CenteredBox>
    );
};