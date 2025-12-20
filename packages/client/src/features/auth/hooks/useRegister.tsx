import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ApiError, ApiResponse, validateAll, validateEmail, validatePassword, validateUsername } from '@syncspace/shared';
// impoting features
import { cleanup, register } from '../../user';
// importing types
import type { FormEvent } from 'react';
import type { IndexedValidationError } from '@syncspace/shared';
import type { AppDispatch, FileState, FormState, RootState } from '../../../types';
import type { AvailabilityState, RegisterFileField, RegisterFormField, RegisterFormPhase } from '../types';
// impoting reducers
import { createErrorHandler, createInitialFormState, formReducer, handleFormDataChange } from '../../../reducers/form.reducer';
import { createInitialFileState, fileReducer } from '../../../reducers/file.reducer';
// importing hooks
import { useErrorSnackBar } from '../../../hooks/useErrorSnackBar';
import { useAuthModal } from './useAuthModal';
// impoting services
import {
    isEmailAvailable as isEmailAvailableService,
    isUsernameAvailable as isUsernameAvailableService,
} from '../services/api.service';

export const useRegisterForm = () => {
    const dispatch = useDispatch<AppDispatch>();

    const startupSetting = useSelector((state: RootState) => state.user.user.setting.startupSetting);
    const registerStatus = useSelector((state: RootState) => state.user.status.register);
    const registerError = useSelector((state: RootState) => state.user.error.register);

    const { closeAuthModal } = useAuthModal();

    const showErrorSnackBar = useErrorSnackBar();

    const [phase, setPhase] = useState<RegisterFormPhase>('CREDENTIALS');

    const naviagteToCredentialsPhase = () => {
        setPhase('CREDENTIALS');
    };

    const naviagteToProfilePhase = () => {
        setPhase('PROFILE');
    };

    const initialFormState: FormState<RegisterFormField> = createInitialFormState(['email', 'password', 'username']);
    const [formData, formDispatch] = useReducer(formReducer<RegisterFormField>, initialFormState);
    const { email, password, username } = formData;
    const onChange = useMemo(() => handleFormDataChange<RegisterFormField>(formDispatch), []);

    const initialFileState: FileState<RegisterFileField> = createInitialFileState(['profilePic']);
    const [fileData, fileDispatch] = useReducer(fileReducer<RegisterFileField>, initialFileState);
    const { profilePic } = fileData;

    const emailRef = useRef<HTMLInputElement | null>(null);
    const passwordRef = useRef<HTMLInputElement | null>(null);
    const usernameRef = useRef<HTMLInputElement | null>(null);
    const refs = { emailRef, passwordRef, usernameRef };

    const registerErrorHandler = createErrorHandler<RegisterFormField>(formDispatch, [emailRef, passwordRef, usernameRef]);

    const [showPassword, setShowPassword] = useState(false);

    const [emailAvailability, setEmailAvailability] = useState<AvailabilityState>(undefined);
    const validateEmailAvailability = async () => {
        setEmailAvailability(undefined);

        const emailValidity = validateEmail(email.value);
        if (emailValidity !== true) {
            setEmailAvailability(false);
            return {
                index: 0,
                src: 'email',
                message: emailValidity.message,
            } as IndexedValidationError;
        }

        const response = await isEmailAvailableService({ email: email.value });
        if (response instanceof ApiError) {
            setEmailAvailability(false);
            return {
                index: 0,
                src: 'email',
                message: response.message,
            } as IndexedValidationError;
        } else if (response instanceof ApiResponse) {
            setEmailAvailability(true);
        }

        return true;
    };

    const [usernameAvailability, setUsernameAvailability] = useState<AvailabilityState>(undefined);
    const validateUsernameAvailability = async () => {
        setUsernameAvailability(undefined);

        const usernameValidity = validateUsername(username.value);
        if (usernameValidity !== true) {
            setUsernameAvailability(false);
            return {
                index: 2,
                src: 'username',
                message: usernameValidity.message,
            } as IndexedValidationError;
        }

        const response = await isUsernameAvailableService({ username: username.value });
        if (response instanceof ApiError) {
            setUsernameAvailability(false);
            return {
                index: 2,
                src: 'username',
                message: response.message,
            } as IndexedValidationError;
        } else if (response instanceof ApiResponse) {
            setUsernameAvailability(true);
        }

        return true;
    };

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            if (registerStatus === 'loading') {
                return;
            }

            const credentialsPhaseValidity = validateAll(validateEmail(email.value), validatePassword(password.value));
            if (credentialsPhaseValidity !== true) {
                throw credentialsPhaseValidity;
            }

            const emailValidity = await validateEmailAvailability();
            if (emailValidity !== true) {
                throw emailValidity;
            }

            if (phase === 'CREDENTIALS') {
                return naviagteToProfilePhase();
            }

            const profilePhaseValidity = validateAll(validateUsername(username.value));
            if (profilePhaseValidity !== true) {
                throw profilePhaseValidity;
            }

            const usernameValidity = await validateUsernameAvailability();
            if (usernameValidity !== true) {
                throw usernameValidity;
            }

            dispatch(register({
                email: email.value,
                password: password.value,
                username: username.value,
                profilePic: profilePic.file,
                startupSettingStr: JSON.stringify(startupSetting),
            }));
        } catch (error) {
            registerErrorHandler(error);
        }
    };

    useEffect(() => {
        if (registerStatus === 'succeeded') {
            closeAuthModal();
            dispatch(cleanup('register'));
        }

        if (registerStatus === 'failed' && registerError) {
            showErrorSnackBar(new ApiError(registerError));
            dispatch(cleanup('register'));
        }
    }, [registerStatus, registerError]);

    return {
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
        naviagteToProfilePhase,
    };
};