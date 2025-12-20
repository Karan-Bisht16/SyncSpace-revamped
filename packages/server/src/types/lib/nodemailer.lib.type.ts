// importing types
import type { Readable } from "stream";
import type { Request } from "express";
import type { AttachmentLike } from "nodemailer/lib/mailer/index.js";
import type Mail from "nodemailer/lib/mailer/index.js";
import type { TokenAction } from "@syncspace/shared";

export type SendMailParams = {
    req: Request,
    to: string,
    subject: string,
    html: string | Buffer | Readable | AttachmentLike,
} & Mail.Options;

export type GetEmailLinkParams = {
    req: Request,
    action: TokenAction,
    data: { _id: any } & Record<string, any>,
    expiresIn: string,
};