import { useSelector } from 'react-redux';
import Button from '@mui/material/Button';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
// impoting icons
import BackIcon from '@mui/icons-material/ArrowBack';
// impoting types
import type { RootState } from '../../../types';
import type { RegisterFormProps } from '../types';
// impoting hooks
import { useRegisterForm } from '../hooks/useRegister';
// impoting components
import { CenteredBox } from '../../../components/CenteredBox';
import { AuthFooter } from './ui/AuthFooter';
import { AuthHeader } from './ui/AuthHeader';
import { RegisterCredentialsForm } from './RegisterCredentialsForm';
import { RegisterProfileForm } from './RegisterProfileForm';
import { SubmitButton } from './ui/SubmitButton';

export const RegisterForm = (props: RegisterFormProps) => {
    const { toggleAuthModal } = props;

    const registerStatus = useSelector((state: RootState) => state.user.status.register);

    const {
        formData,
        formDispatch,
        onChange,
        fileData,
        fileDispatch,
        refs,
        showPassword,
        setShowPassword,
        emailAvailability,
        validateEmailAvailability,
        usernameAvailability,
        validateUsernameAvailability,
        handleRegister,
        phase,
        naviagteToCredentialsPhase,
    } = useRegisterForm();

    const { email, password, username } = formData;
    const { emailRef, passwordRef, usernameRef } = refs;
    const { profilePic } = fileData;

    const steps = ['Account Details', 'Profile Setup'];
    const activeStep = phase === 'CREDENTIALS' ? 0 : 1;

    return (
        <CenteredBox sx={{ flexDirection: 'column', gap: 2, width: '100%' }}>
            <AuthHeader
                lordIcon={{ src: 'https://cdn.lordicon.com/kdduutaw.json', size: '30px' }}
                heading='Create Account'
                subHeading={phase === 'CREDENTIALS'
                    ? 'Enter your credentials to get started'
                    : 'Complete your profile to finish registration'}
            />

            <Stepper
                activeStep={activeStep}
                alternativeLabel sx={{
                    width: '100%',
                    '.MuiStepLabel-iconContainer svg': { fontSize: 16, mt: 0.55 },
                    '.MuiStepLabel-labelContainer span': { fontSize: 12, mt: 0.95 },
                }}>
                {steps.map((label) => (
                    <Step key={label} sx={{ fontSize: 12 }}>
                        <StepLabel>
                            {label}
                        </StepLabel>
                    </Step>
                ))}
            </Stepper>

            <CenteredBox
                component='form'
                sx={{ flexDirection: 'column', width: '100%' }}
                onSubmit={handleRegister}
            >
                <CenteredBox sx={{ flexDirection: 'column', gap: 2.75, width: '100%' }}>
                    {phase === 'CREDENTIALS' &&
                        <RegisterCredentialsForm
                            email={email}
                            password={password}
                            emailRef={emailRef}
                            passwordRef={passwordRef}
                            formDispatch={formDispatch}
                            onChange={onChange}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            emailAvailability={emailAvailability}
                            validateEmailAvailability={validateEmailAvailability}
                            submitting={registerStatus === 'loading'}
                        />
                    }
                    {phase === 'PROFILE' &&
                        <RegisterProfileForm
                            username={username}
                            profilePic={profilePic}
                            usernameRef={usernameRef}
                            onChange={onChange}
                            formDispatch={formDispatch}
                            fileDispatch={fileDispatch}
                            usernameAvailability={usernameAvailability}
                            validateUsernameAvailability={validateUsernameAvailability}
                            submitting={registerStatus === 'loading'}
                        />
                    }
                </CenteredBox>

                <SubmitButton
                    label={phase === 'CREDENTIALS' ? 'Continue' : 'Register'}
                    submitting={registerStatus === 'loading'}
                />

                {phase === 'CREDENTIALS' && <AuthFooter authMode='register' toggleAuthModal={toggleAuthModal} />}

                {phase === 'PROFILE' &&
                    <Button
                        variant='text'
                        onClick={naviagteToCredentialsPhase}
                        startIcon={<BackIcon />}
                        disabled={registerStatus === 'loading'}
                        fullWidth
                        sx={{
                            mt: 1,
                            color: 'text.secondary',
                            '&:hover': { bgcolor: 'action.hover', color: 'primary.main' },
                        }}
                    >
                        Back to credentials
                    </Button>
                }
            </CenteredBox>
        </CenteredBox>
    );
};