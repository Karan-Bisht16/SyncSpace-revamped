// importing types
import type { JwtPayload } from "jsonwebtoken";
import type { TokenAction } from "@syncspace/shared";

export type JwtFieldTypes = { [key: string]: "string" | "number" | "boolean" };

export type ParseJwtPayloadReturnType<
    T extends JwtFieldTypes
> = { [K in keyof T]: T[K] extends "string" ? string :
    (T[K] extends "number" ? number :
        (T[K] extends "boolean" ? boolean :
            unknown))
} & JwtPayload;

export type ValidateTokenParams<T extends JwtFieldTypes> = {
    action: TokenAction,
    token?: string,
    fields?: T,
};