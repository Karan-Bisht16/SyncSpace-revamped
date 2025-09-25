// importing types
import type { Readable } from "stream";
import type { Request } from "express";
import type { AttachmentLike } from "nodemailer/lib/mailer/index.js";
import type Mail from "nodemailer/lib/mailer/index.js";

export type EmailActions = 'resetPassword' | 'updateEmail';

export type SendMailParams = {
    req: Request,
    to: string,
    subject: string,
    html: string | Buffer | Readable | AttachmentLike,
} & Mail.Options;

export type GetEmailLinkParams = {
    req: Request,
    action: EmailActions,
    data: { _id: any } & Record<string, any>,
    expiresIn: string,
};