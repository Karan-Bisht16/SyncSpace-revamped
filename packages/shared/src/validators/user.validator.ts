import { FeedLayouts, Themes } from '../types/index.js';
// importing data
import { sharedConfig } from '../data/constants.data.js';
// importing types
import type { FeedLayout, Theme, ValidationError } from '../types/index.js';
// importing utils
import { isFileAccepted, isMulterFile } from '../utils/file.util.js';
// importing validators
import { isBoolean, isObject, isString } from './type.validator.js';

const {
    emailRegex,
    usernameRegex,
    maxPasswordLength,
    maxProfilePicSizeMB,
    maxUsernameLength,
    minPasswordLength,
} = sharedConfig;

export const validateEmail = (email: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(email)) {
        validationMessage = 'No email provided';
    } else if (!emailRegex.test(email)) {
        validationMessage = 'Email is invalid';
    } else {
        return true;
    }

    return { message: validationMessage, src: 'email' };
};

export const validatePassword = (password: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(password)) {
        validationMessage = 'No password provided';
    } else if (password.length < minPasswordLength) {
        validationMessage = `Password must be atleast ${minPasswordLength} characters long`;
    } else if (password.length > maxPasswordLength) {
        validationMessage = `Password can be atmost ${maxPasswordLength} characters long`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'password' };
};

export const validateCurrentPassword = (password: unknown): true | ValidationError => {
    const validation = validatePassword(password);
    if (validation !== true) {
        return { ...validation, src: 'currentPassword' };
    }

    return validation;
};

export const validateNewPassword = (password: unknown): true | ValidationError => {
    const validation = validatePassword(password);
    if (validation !== true) {
        return { ...validation, src: 'newPassword' };
    }

    return validation;
};

export const validateUsername = (username: unknown): true | ValidationError => {
    let validationMessage;
    if (!isString(username)) {
        validationMessage = 'No user name provided';
    } else if (!usernameRegex.test(username)) {
        validationMessage = 'User name is invalid';
    } else if (username.length > maxUsernameLength) {
        validationMessage = `User name can be atmost ${maxUsernameLength} characters long`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'username' };
};

export const validateProfilePic = (profilePic: unknown): true | ValidationError => {
    let validationMessage;
    if (!(profilePic instanceof File || isMulterFile(profilePic))) {
        validationMessage = 'No file provided';
    } else if (profilePic.size > maxProfilePicSizeMB * 1024 * 1024) {
        validationMessage = `User profile photo can be atmost ${maxProfilePicSizeMB}MB`;
    } else if (!isFileAccepted({ file: profilePic, accept: 'image/*' })) {
        const profilePicType = 'type' in profilePic ? profilePic.type : profilePic.mimetype;
        validationMessage = `File type ${profilePicType} not allowed. Only image types are allowed`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'profilePic' };
};

export const validateStartupSetting = (startupSetting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(startupSetting)) {
        validationMessage = 'No setting provided';
    } else if (!('theme' in startupSetting && Themes.includes(startupSetting.theme as Theme))) {
        validationMessage = `Invalid 'Theme' provided`;
    } else if (!('feedLayout' in startupSetting && FeedLayouts.includes(startupSetting.feedLayout as FeedLayout))) {
        validationMessage = `Invalid 'Feed Layout' provided`;
    } else if (!('showMature' in startupSetting && isBoolean(startupSetting.showMature))) {
        validationMessage = `Invalid 'Show Mature' provided`;
    } else if (!('blurMature' in startupSetting && isBoolean(startupSetting.blurMature))) {
        validationMessage = `Invalid 'Blur Mature' provided`;
    } else if (!('autoplayMedia' in startupSetting && isBoolean(startupSetting.autoplayMedia))) {
        validationMessage = `Invalid 'Autoplay Media' provided`;
    } else if (!('openPostNewTab' in startupSetting && isBoolean(startupSetting.openPostNewTab))) {
        validationMessage = `Invalid 'Open Post in new Tab' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

export const validateGeneralSetting = (generalSetting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(generalSetting)) {
        validationMessage = 'No setting provided';
    } else if (!('markMature' in generalSetting && isBoolean(generalSetting.markMature))) {
        validationMessage = `Invalid 'Mark Mature' provided`;
    } else if (!('showFollowers' in generalSetting && isBoolean(generalSetting.showFollowers))) {
        validationMessage = `Invalid 'Show Followers' provided`;
    } else if (!('allowFollow' in generalSetting && isBoolean(generalSetting.allowFollow))) {
        validationMessage = `Invalid 'Allow Follow' provided`;
    } else if (!('pauseHistory' in generalSetting && isBoolean(generalSetting.pauseHistory))) {
        validationMessage = `Invalid 'Pause History' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

export const validateSetting = (setting: unknown): true | ValidationError => {
    let validationMessage;
    if (!isObject(setting)) {
        validationMessage = 'No setting provided';
    } else if (!('startupSetting' in setting && validateStartupSetting(setting.startupSetting) === true)) {
        validationMessage = `Invalid 'Startup Setting' provided`;
    } else if (!('generalSetting' in setting && validateGeneralSetting(setting.generalSetting) === true)) {
        validationMessage = `Invalid 'General Setting' provided`;
    } else {
        return true;
    }

    return { message: validationMessage, src: 'setting' };
};

// TODO: add a validateReauthPassword for different error messsage
// or just pass src/type in arg so that we can send different error messages based on that
// like validate password can have src: login, register, reauth