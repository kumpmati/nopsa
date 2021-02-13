/**
 * Returns the course code
 * @param {Array} arr
 * @returns {String}
 */
export const getCourseCode = (arr) => (arr.length > 0 ? arr[0].str : null);

/**
 * Returns the course name
 * @param {Array} courseItems
 * @returns {String}
 */
export const getCourseName = (arr) => (arr.length > 1 ? arr[1].str : null);

/**
 * Returns the course credits
 * @param {Array} arr
 */
export const getCourseCredits = (arr) => {
  const a = arr[arr.length - 4].str;
  const b = arr[arr.length - 5].str;
  return parseInt(a) || parseInt(b) || 0;
};

/**
 * Returns the course grade
 * @param {Array} arr
 * @returns {String}
 */
export const getCourseGrade = (arr) => {
  return arr.length > 1 ? arr[arr.length - 2].str : 0;
};

/**
 * Returns the course level
 * @param {Array} arr
 * @returns {String}
 */
export const getCourseLevel = (arr) =>
  arr.length > 2 ? arr[arr.length - 3].str : null;

/**
 * Returns the course date
 * @param {Array} arr
 * @returns {Date}
 */
export const getCourseDate = (arr) => {
  const dateStr = arr.length > 0 ? arr[arr.length - 1].str : null;
  const [day, month, year] = dateStr.split(".");

  return new Date(year, month - 1, day);
};
