import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
// importing config
import { EMAIL_SECRET, MODE, NODEMAILER_APP_PASSWORD, NODEMAILER_EMAIL } from '../config/env.config.js';
// importing types
import type { GetEmailLinkParams, SendMailParams } from '../types/index.js';
import type { UserDocument } from '@syncspace/shared';
// importing services
import { logToDb } from '../services/log.service.js';
// importing utils
import { validateReqOrigin } from '../utils/validateReq.util.js';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: NODEMAILER_EMAIL,
        pass: NODEMAILER_APP_PASSWORD,
    },
});

export const getEmail = (user: UserDocument) => {
    if (MODE === 'DEVELOPMENT') {
        return 'karan161003@gmail.com';
    }

    return user.email;
};

export const sendMail = async (params: SendMailParams) => {
    const { req, to, subject, html, ...rest } = params;

    const mailOptions = {
        to,
        subject,
        html,
        ...rest,
    };

    transporter.sendMail(mailOptions, async (error, info) => {
        if (error) {
            await logToDb({
                type: 'error',
                payload: {
                    req,
                    description: error?.message,
                    userId: req.user?._id,
                    stack: error?.stack,
                },
            });
        }
    });
};

export const getEmailLink = async (params: GetEmailLinkParams) => {
    const { req, action, data, expiresIn } = params;

    const origin = validateReqOrigin(req);

    const emailToken = jwt.sign(
        { action: action, ...data },
        EMAIL_SECRET,
        { expiresIn: expiresIn as any }
    );

    return `${origin}/email/${action}/${emailToken}`;
};