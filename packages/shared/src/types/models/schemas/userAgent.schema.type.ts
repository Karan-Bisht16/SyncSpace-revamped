export type UserAgentSchema = {
    raw: String,
    browser: {
        name?: String,
        version?: String,
    },
    os: {
        name?: String,
        version?: String,
    },
    device: {
        type?: String,
        model?: String,
    },
};