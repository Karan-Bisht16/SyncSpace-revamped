// importing types;
import type { VerifyEmailPromptProps } from "../types";

export const VerifyEmailPrompt = (props: VerifyEmailPromptProps) => {
    const { token } = props;

    return (
        <div>
            {token}
        </div>
    );
};