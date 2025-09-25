export const formattedString = (string: string, length = 8) => {
    if (string.length > length) {
        return string.substring(0, 8) + '...';
    }
    return string;
};

export const toSentenceCase = (string: string) => {
    return string.charAt(0).toUpperCase() + string.substring(1, string.length);
};