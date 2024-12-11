export const formatTimeStamp = (postedDate) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - postedDate) / 1000);
    if (diffInSeconds < 60) {
        return `${diffInSeconds} second(s) ago`;
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute(s) ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour(s) ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return `${diffInDays} day(s) ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} month(s) ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year(s) ago`;
}