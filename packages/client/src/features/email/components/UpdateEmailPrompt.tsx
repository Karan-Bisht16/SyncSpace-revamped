// importing types
import type { UpdateEmailPromptProps } from "../types";

export const UpdateEmailPrompt = (props: UpdateEmailPromptProps) => {
    const { token } = props;

    return (
        <div>
            {token}
        </div>
    );
};