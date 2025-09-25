// importing types
import type { JwtPayload } from "jsonwebtoken";
import type { EmailActions } from "./nodemailer.lib.type.js";

export type JwtFieldTypes = { [key: string]: "string" | "number" | "boolean" };

export type ParseJwtPayloadReturnType<T extends JwtFieldTypes> = { [K in keyof T]: T[K] extends "string" ?
    string : (T[K] extends "number" ?
        number : (T[K] extends "boolean" ?
            boolean : unknown))
} & JwtPayload;

export type DecodeEmailTokenParams<T extends JwtFieldTypes> = {
    action: EmailActions,
    token?: string,
    fields?: T,
};