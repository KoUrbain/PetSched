import dayjs from 'dayjs';
import isToday from 'dayjs/plugin/isToday';
import isTomorrow from 'dayjs/plugin/isTomorrow';
import isoWeek from 'dayjs/plugin/isoWeek';

dayjs.extend(isToday);
dayjs.extend(isTomorrow);
dayjs.extend(isoWeek);

export const now = () => dayjs();
export const formatTime = (date: string | Date | null) => (date ? dayjs(date).format('HH:mm') : '');
export const formatDay = (date: string | Date) => dayjs(date).format('ddd, MMM D');
export const isSameDay = (a: string | Date, b: string | Date) => dayjs(a).isSame(b, 'day');
export const startOfToday = () => dayjs().startOf('day');
export const startOfTomorrow = () => dayjs().add(1, 'day').startOf('day');
export const sevenDayRange = () => Array.from({ length: 7 }, (_, i) => dayjs().add(i, 'day'));

export default dayjs;
