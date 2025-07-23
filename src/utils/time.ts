import dayjs from 'dayjs';

/**
 * 将日期转换为指定格式的字符串https://dayjs.fenxianglu.cn/category/parse.html#%E5%AD%97%E7%AC%A6%E4%B8%B2-%E6%A0%BC%E5%BC%8F
 *
 * @param date 日期参数，可以是Date对象、时间戳(毫秒或秒)或dayjs可解析的字符串
 * @param format 日期格式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串，出错时返回空字符串
 */
export const formatDateTime = (date: string | number | Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  try {
    if (!date) {
      return '';
    }
    // 处理 Unix 时间戳（秒）
    if (/^\d+$/.test(date.toString()) && date.toString().length === 10) {
      return dayjs.unix(Number(date)).format(format);
    }
    return dayjs(date).format(format);
  } catch (error) {
    console.error('格式化日期时间出错:', error);
    return '';
  }
};

// 使用示例：
// formatDateTime(new Date()); // 返回当前时间，如：2023-05-18 15:30:45
// formatDateTime('2025-03-04'); // 返回：2025-03-04 00:00:00
// formatDateTime(1709497200000); // 返回：2025-03-04 01:53:20 (毫秒时间戳)
// formatDateTime(1709497200); // 返回：2025-03-04 01:53:20 (秒时间戳)
// formatDateTime(new Date(), 'YYYY/MM/DD'); // 返回：2023/05/18
