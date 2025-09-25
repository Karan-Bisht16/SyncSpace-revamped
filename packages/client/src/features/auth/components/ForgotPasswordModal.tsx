import { validateEmail } from '@syncspace/shared';
import Button from '@mui/material/Button';
// importing hooks
import { useAuthModal } from '../hooks/useAuthModal';
import { useForgotPassword } from '../hooks/useForgotPassword';
// importing components
import { CenteredBox } from '../../../components/CenteredBox';
import { FormTextField } from '../../../components/FormTextField';
import { GenericAuthModal } from '../../../components/GenericAuthModal';

export const ForgotPasswordModal = () => {
    const {
        formData,
        formDispatch,
        onChange,
        emailRef,
        handleSubmit,
        forgotPasswordStatus,
    } = useForgotPassword();
    const { closeForgotPasswordModal } = useAuthModal();

    const { email } = formData;

    const forgotPasswordSucceeded = forgotPasswordStatus === 'succeeded';

    return (
        <GenericAuthModal
            heading={forgotPasswordSucceeded ? 'Reset mail send' : 'Forgot Password?'}
            subHeading={forgotPasswordSucceeded ?
                `If this email is registered with us, you'll receive a password reset link shortly.` :
                'Enter your registered email on which you want to recieve reset mail'
            }
            lordicon={{
                src: forgotPasswordSucceeded ?
                    'https://cdn.lordicon.com/fsstjlds.json' :
                    'https://cdn.lordicon.com/dicvhxpz.json',
            }}
        >
            {forgotPasswordSucceeded ?
                <Button fullWidth variant='outlined' onClick={closeForgotPasswordModal}>
                    Close modal
                </Button> :
                <CenteredBox
                    component='form'
                    sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
                    onSubmit={handleSubmit}
                >
                    <FormTextField
                        name='email'
                        label='Email'
                        type={'text'}
                        data={email}
                        submitting={forgotPasswordStatus === 'loading'}
                        onChange={onChange}
                        inputRef={emailRef}
                        dispatch={formDispatch}
                        validate={validateEmail}
                        required
                    />

                    <CenteredBox sx={{ gap: 2, justifyContent: 'flex-end', width: '100%' }}>
                        <Button variant='outlined' onClick={closeForgotPasswordModal}>Cancel</Button>
                        <Button type='submit' variant='contained'>Ok</Button>
                    </CenteredBox>
                </CenteredBox>
            }
        </GenericAuthModal>
    );
};