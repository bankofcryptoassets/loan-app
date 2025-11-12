export const monthMap: Record<number, string> = {
    0: 'JAN',
    1: 'FEB',
    2: 'MAR',
    3: 'APR',
    4: 'MAY',
    5: 'JUN',
    6: 'JUL',
    7: 'AUG',
    8: 'SEP',
    9: 'OCT',
    10: 'NOV',
    11: 'DEC',
};

export function unixToDateString(unixTimestamp: number) {
    const date = new Date(unixTimestamp * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = monthMap[date.getMonth()]; // Months are 0-indexed
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

export function monthsToSeconds(numberOfMonths: number): number {
    const secondsPerDay = 24 * 60 * 60; // 86400 seconds
    const daysPerMonth = 30; // Standard month length for financial calculations
    return numberOfMonths * daysPerMonth * secondsPerDay;
}
