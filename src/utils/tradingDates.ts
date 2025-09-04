import { format, isWeekend, addDays, subDays, nextMonday, previousFriday } from 'date-fns';

// Indian market holidays for 2025 (simplified - major holidays)
const INDIAN_HOLIDAYS_2025 = [
  '2025-01-26', // Republic Day
  '2025-03-14', // Holi
  '2025-04-14', // Ram Navami
  '2025-04-18', // Good Friday
  '2025-05-01', // Labour Day
  '2025-08-15', // Independence Day
  '2025-10-02', // Gandhi Jayanti
  '2025-11-01', // Diwali (Lakshmi Puja)
  '2025-11-21', // Guru Nanak Jayanti
  '2025-12-25', // Christmas
];

const isHoliday = (date: Date): boolean => {
  const dateString = format(date, 'yyyy-MM-dd');
  return INDIAN_HOLIDAYS_2025.includes(dateString);
};

const isTradingDay = (date: Date): boolean => {
  return !isWeekend(date) && !isHoliday(date);
};

export const getCurrentDateTime = () => {
  const now = new Date();
  return {
    date: format(now, 'MMMM dd, yyyy'),
    day: format(now, 'EEEE'),
    time: format(now, 'hh:mm:ss a'),
    timestamp: now,
  };
};

export const getLastTradingDate = () => {
  let date = new Date();
  
  // If today is a trading day and market hours (9:15 AM - 3:30 PM IST)
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  const marketStart = 9 * 60 + 15; // 9:15 AM
  const marketEnd = 15 * 60 + 30; // 3:30 PM
  
  // If it's currently a trading day and market is open/closed for the day
  if (isTradingDay(date) && currentTime >= marketStart) {
    return {
      date: format(date, 'MMMM dd, yyyy'),
      day: format(date, 'EEEE'),
      time: '03:30:00 PM',
      timestamp: date,
    };
  }
  
  // Otherwise, find the last trading day
  date = subDays(date, 1);
  while (!isTradingDay(date)) {
    date = subDays(date, 1);
  }
  
  return {
    date: format(date, 'MMMM dd, yyyy'),
    day: format(date, 'EEEE'),
    time: '03:30:00 PM',
    timestamp: date,
  };
};

export const getNextTradingDate = () => {
  let date = new Date();
  
  // If today is a trading day and market hasn't opened yet (before 9:15 AM IST)
  const currentHour = date.getHours();
  const currentMinute = date.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;
  const marketStart = 9 * 60 + 15; // 9:15 AM
  
  if (isTradingDay(date) && currentTime < marketStart) {
    return {
      date: format(date, 'MMMM dd, yyyy'),
      day: format(date, 'EEEE'),
      time: '09:15:00 AM',
      timestamp: date,
    };
  }
  
  // Otherwise, find the next trading day
  date = addDays(date, 1);
  while (!isTradingDay(date)) {
    date = addDays(date, 1);
  }
  
  return {
    date: format(date, 'MMMM dd, yyyy'),
    day: format(date, 'EEEE'),
    time: '09:15:00 AM',
    timestamp: date,
  };
};

export const getMarketStatus = () => {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const marketStart = 9 * 60 + 15; // 9:15 AM
  const marketEnd = 15 * 60 + 30; // 3:30 PM
  
  if (!isTradingDay(now)) {
    return {
      status: 'CLOSED' as const,
      message: 'Market is closed (Holiday/Weekend)',
      nextAction: 'Opens',
      nextTime: getNextTradingDate(),
    };
  }
  
  if (currentTime < marketStart) {
    return {
      status: 'PRE_MARKET' as const,
      message: 'Market opens in',
      nextAction: 'Opens',
      nextTime: getNextTradingDate(),
    };
  }
  
  if (currentTime >= marketStart && currentTime <= marketEnd) {
    return {
      status: 'OPEN' as const,
      message: 'Market is open',
      nextAction: 'Closes',
      nextTime: {
        date: format(now, 'MMMM dd, yyyy'),
        day: format(now, 'EEEE'),
        time: '03:30:00 PM',
        timestamp: now,
      },
    };
  }
  
  return {
    status: 'CLOSED' as const,
    message: 'Market is closed',
    nextAction: 'Opens',
    nextTime: getNextTradingDate(),
  };
};