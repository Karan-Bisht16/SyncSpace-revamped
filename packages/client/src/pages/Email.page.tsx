// import { useEffect, useMemo, useReducer, useRef, useState, type FormEvent } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom'
// import { ApiError, ApiResponse, TokenActions, validateAll, validateNewPassword, type TokenAction } from '@syncspace/shared';
// import Button from '@mui/material/Button';
// // importing icons
// import ResetTokenExpiredIcon from '@mui/icons-material/CloseRounded';
// // importing features
// import { cleanup, resetPassword } from '../features/user';
// // importing types
// import type { ApiCallStatus, AppDispatch, FormState, RootState } from '../types';
// // importing hooks
// import { useErrorSnackBar } from '../hooks/useErrorSnackBar';
// // importing reducers
// import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../reducers/form.reducer';
// // importing services
// import {
//     decodeResetPasswordToken as decodeResetPasswordTokenService,
// } from '../features/auth/services/api.service';
// // importing components
// import { CenteredBox } from '../components/CenteredBox';
// import { GenericAuthModal } from '../components/GenericAuthModal';
// import { LoadingModal } from '../components/LoadingModal';
// import { PageBase } from '../components/PageBase'
// import { FormTextField } from '../components/FormTextField';

import { EmailHandler } from "../features/email";
import { CenteredBox } from '../components/CenteredBox';
import { PageBase } from '../components/PageBase';

// export type ResetPasswordField = 'newPassword';

// const Email = () => {
//     const { emailAction, emailToken } = useParams();

//     const navigate = useNavigate();
//     const showErrorSnackBar = useErrorSnackBar();

//     if (!TokenActions.includes(emailAction as TokenAction)) {
//         return navigate('/');
//     }

//     if (emailAction === 'resetPassword') {

//     }

//     // decodeResetPasswordToken
//     const [decodeResetPasswordTokenStatus, setDecodeResetPasswordTokenStatus] = useState<ApiCallStatus>('loading');

//     const decodeResetPasswordToken = async (resetPasswordToken: string) => {
//         const response = await decodeResetPasswordTokenService({ resetPasswordToken });
//         if (response instanceof ApiError) {
//             setDecodeResetPasswordTokenStatus('failed');
//         } else if (response instanceof ApiResponse) {
//             setDecodeResetPasswordTokenStatus('succeeded');
//         }
//     };

//     useEffect(() => {
//         if (resetPasswordToken) {
//             decodeResetPasswordToken(resetPasswordToken);
//         } else {
//             navigate('/', { replace: true });
//         }
//     }, [resetPasswordToken]);

//     // resetPassword
//     const dispatch = useDispatch<AppDispatch>();

//     const resetPasswordStatus = useSelector((state: RootState) => state.user.status.resetPassword);
//     const resetPasswordError = useSelector((state: RootState) => state.user.error.resetPassword);

//     const initialFormState: FormState<ResetPasswordField> = createInitialFormState(['newPassword']);
//     const [formData, formDispatch] = useReducer(formReducer<ResetPasswordField>, initialFormState);
//     const { newPassword } = formData;
//     const onChange = useMemo(() => handleFormDataChange<ResetPasswordField>(formDispatch), []);

//     const newPasswordRef = useRef<HTMLInputElement | null>(null);

//     const resetPasswordErrorHandler = createErrorHandler<ResetPasswordField>(formDispatch, [newPasswordRef]);

//     const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//         event.preventDefault();

//         try {
//             if (resetPasswordStatus === 'loading') {
//                 return;
//             }

//             const credentialsValidity = validateAll(validateNewPassword(newPassword.value));
//             if (credentialsValidity !== true) {
//                 throw credentialsValidity;
//             }

//             dispatch(resetPassword({ resetPasswordToken: resetPasswordToken as string, newPassword: newPassword.value }));
//         } catch (error) {
//             resetPasswordErrorHandler(error);
//         }
//     };

//     useEffect(() => {
//         if (resetPasswordStatus === 'succeeded') {
//             dispatch(cleanup('resetPassword'));
//             navigate('/', { replace: true });
//         }

//         if (resetPasswordStatus === 'failed' && resetPasswordError) {
//             showErrorSnackBar(new ApiError(resetPasswordError));
//             dispatch(cleanup('resetPassword'));
//         }
//     }, [resetPasswordStatus, resetPasswordError]);

//     // return 
//     if (decodeResetPasswordTokenStatus === 'loading') {
//         return (
//             <LoadingModal
//                 loader={{ progress: 'linear', size: 360 }}
//                 children='Fetching reset form'
//             />
//         );
//     }

//     return (
//         <PageBase sx={{ height: '100vh' }}>
//             <CenteredBox sx={{ height: '100%' }}>
//                 {decodeResetPasswordTokenStatus === 'failed' &&
//                     <GenericAuthModal
//                         heading='Link has expired'
//                         subHeading={`Please retry by going to login and performing forgot password. if your entered email is in db then you' ll get an email. pinky promise`}
//                         sx={{ p: 4, bgcolor: 'background.default' }}
//                         customIcon={<ResetTokenExpiredIcon />}
//                     >
//                         <CenteredBox sx={{ flexDirection: 'column', gap: 1.25, width: '100%' }}>
//                             <Button variant='contained' fullWidth onClick={() => navigate('/auth/login')}>
//                                 Navigate to login
//                             </Button>
//                             <Button variant='outlined' fullWidth onClick={() => navigate('/')}>
//                                 Navigate to home
//                             </Button>
//                         </CenteredBox>
//                     </GenericAuthModal>
//                 }
//                 {decodeResetPasswordTokenStatus === 'succeeded' &&
//                     <GenericAuthModal
//                         heading='Reset Password'
//                         subHeading='Reset password init?'
//                         sx={{ p: 4, bgcolor: 'background.default', border: '1px solid' }}
//                     >
//                         <CenteredBox
//                             component='form'
//                             sx={{ flexDirection: 'column', gap: 1.75, width: '100%' }}
//                             onSubmit={handleSubmit}
//                         >
//                             <FormTextField
//                                 name='newPassword'
//                                 label='New Password'
//                                 type={'text'}
//                                 data={newPassword}
//                                 submitting={resetPasswordStatus === 'loading'}
//                                 onChange={onChange}
//                                 inputRef={newPasswordRef}
//                                 dispatch={formDispatch}
//                                 validate={validateNewPassword}
//                                 required
//                             />
//                         </CenteredBox>
//                     </GenericAuthModal>}
//             </CenteredBox>
//         </PageBase >
//     );
// };

// export default Email;

const Email = () => {
    const { action, token } = useParams();

    const navigate = useNavigate();

    if (!action || !token) {
        navigate('/', { replace: true });
        return;
    }

    return (
        <PageBase sx={{ height: '100vh' }}>
            <CenteredBox sx={{ height: '100%' }}>
                <EmailHandler action={action} token={token} />
            </CenteredBox>
        </PageBase>
    );
};

export default Email;