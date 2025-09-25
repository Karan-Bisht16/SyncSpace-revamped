import { useEffect } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import { validatePassword } from '@syncspace/shared';
// importing icons
import HidePasswordIcon from '@mui/icons-material/VisibilityOff';
import InvalidIcon from '@mui/icons-material/Close';
import ShowPasswordIcon from '@mui/icons-material/Visibility';
import ValidIcon from '@mui/icons-material/Check';
// importing types
import type { RegisterCredentialsFormProps } from '../types';
// importing hooks
import { useMobile } from '../../../hooks/useMobile';
// importing components
import { FormTextField } from '../../../components/FormTextField';

export const RegisterCredentialsForm = (props: RegisterCredentialsFormProps) => {
    const {
        email,
        password,
        emailRef,
        passwordRef,
        formDispatch,
        onChange,
        showPassword,
        setShowPassword,
        emailAvailability,
        validateEmailAvailability,
        submitting,
    } = props;

    const isMobile = useMobile();

    useEffect(() => {
        if (!isMobile) {
            emailRef.current?.focus();
        }
    }, [isMobile]);

    return (
        <>
            <FormTextField
                name='email'
                label='Email'
                data={email}
                submitting={submitting}
                onChange={onChange}
                inputRef={emailRef}
                dispatch={formDispatch}
                validate={validateEmailAvailability}
                required
                slotProps={{
                    input: {
                        endAdornment: (
                            emailAvailability !== undefined &&
                            <InputAdornment
                                position='end'
                                sx={{ color: emailAvailability ? 'success.main' : 'error.main' }}
                            >
                                {emailAvailability ? <ValidIcon fontSize='small' /> : <InvalidIcon fontSize='small' />}
                            </InputAdornment>
                        ),
                    },
                }}
            />

            <FormTextField
                name='password'
                label='Password'
                type={showPassword ? 'text' : 'password'}
                data={password}
                submitting={submitting}
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
        </>
    );
};