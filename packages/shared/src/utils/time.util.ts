const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const getLocalDateTime = (date: Date) => {
    return date.toLocaleString(undefined);
};

export const getCondenseDate = (date: Date) => {
    const month = months[date.getMonth()];
    return `${month.substring(0, 3)} ${date.getDate()}`;
};

export const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffInMin = Math.floor(diffInSec / 60);
    const diffInHrs = Math.floor(diffInMin / 60);

    if (diffInSec < 60) {
        return `${diffInSec}s`;
    } else if (diffInMin < 60) {
        return `${diffInMin}m`;
    } else if (diffInHrs < 24) {
        return `${diffInHrs}h`;
    } else {
        return getCondenseDate(date);
    }
};

export const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;

export const hrsToMs = (hrs: number) => hrs * 60 * 60 * 1000;

export const minsToMs = (mins: number) => mins * 60 * 1000;

export const getUserTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;