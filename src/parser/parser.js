import { courseCodeRegexp, dateRegexp } from "./constants";
import {
  getCourseCode,
  getCourseCredits,
  getCourseDate,
  getCourseGrade,
  getCourseLevel,
  getCourseName,
} from "./extractors";

/**
 * Attempts to analyze a PDF file
 * @param {File} file
 */
export const analyzePDF = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // parse after reading file contents
    reader.onload = async () => {
      try {
        resolve(await parse(reader.result));
      } catch (parseErr) {
        reject(parseErr);
      }
    };

    reader.readAsDataURL(file); // reads to base64
  });
};

/**
 * Parses the given base64 string into a PDF and extracts course data from it.
 * @param {String} data
 */
const parse = async (data) => {
  const pdf = await pdfjsLib.getDocument(data).promise; // loads PDF from base64 data

  let result = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    await pdf.getPage(pageNum).then(async (page) => {
      const items = (await page.getTextContent()).items; // array of all text items on the page
      result.push(...extractCoursesFromText(items));
    });
  }

  if (!result.length) throw new Error("No courses found");

  return result;
};

/**
 * Extracts individual courses from an array of PDF text items.
 * @param {Array} textItems Array of PDF text items from the transcript
 */
const extractCoursesFromText = (textItems) => {
  let courses = [];

  let prevCourseCodeIndex = -1;

  textItems.forEach((item, i) => {
    const isCourseCode = courseCodeRegexp.test(item.str);
    const isDate = dateRegexp.test(item.str);
    if (!isCourseCode && !isDate) return;

    if (isCourseCode) {
      prevCourseCodeIndex = i; // update course code index
      return;
    }

    if (isDate) {
      /*
       * The date should be the last bit of info about a course,
       * so at this point we can construct a course from the array items
       * between the course code and the date.
       */
      const courseItems = textItems.slice(prevCourseCodeIndex, i + 1);
      const course = parseSingleCourse(courseItems);
      if (course) courses.push(course);
    }
  });

  return courses;
};

/**
 * Formats an array containing all course info into a course object.
 * First item in array should be the course code,
 * and the last item should be the course date.
 * @param {Array} courseItems Array of items containing course info
 */
const parseSingleCourse = (courseItems) => {
  if (courseItems.length < 6) return; // discard course if info is missing

  const course = {
    code: getCourseCode(courseItems),
    name: getCourseName(courseItems),
    credits: getCourseCredits(courseItems),
    level: getCourseLevel(courseItems),
    grade: getCourseGrade(courseItems),
    date: getCourseDate(courseItems),
  };

  // TODO: handle study modules differently
  if (course.level === "O") return; // discard study modules

  return course;
};
