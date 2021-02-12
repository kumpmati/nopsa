/*
 * Regular expressions used to find specific items
 */
const courseNumberRegexp = /([a-zA-Z]{4}\d{4}|[a-zA-Z]{3}\d{5})/;

/**
 * Attempts to analyze a PDF file
 * @param {File} file
 */
export async function analyzePDF(file) {
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

    reader.readAsDataURL(file); // reads file contents as base64
  });
}

/**
 * Parses the PDF file for course info
 * @param {String} data
 */
async function parse(data) {
  const pdf = await pdfjsLib.getDocument(data).promise; // loads PDF from base64 data
  let result = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    await pdf.getPage(pageNum).then(async (page) => {
      const items = (await page.getTextContent()).items; // array of all text items on the page

      console.log(items);
      const itemIndexes = findCourseCodes(items);
      if (itemIndexes.length === 0) {
        throw new Error("No courses found");
      }

      itemIndexes.forEach((i) => {
        const courseDetails = getCourseDetails(items, i);
        if (courseDetails) {
          result.push(courseDetails);
        }
      });
    });
  }

  return result;
}

/**
 * Returns an array of indexes, where each index
 * corresponds to a text item of a course code
 * @param {*} items
 * @param {*} pattern
 */
const findCourseCodes = (items) => {
  return items.reduce((arr, item) => {
    if (courseNumberRegexp.test(item.str)) {
      // match only course code
      arr.push(items.indexOf(item));
    }
    return arr;
  }, []);
};

/**
 * Returns all the available details for a course based on the given index.
 * @param {*} items Array of PDF text items
 * @param {*} index Index of the course code in the array
 */
const getCourseDetails = (items, index) => {
  const [code, name, credits, level, grade, date] = items.slice(
    index,
    index + 6
  );

  const [day, month, year] = date.str.split(".");

  return {
    code: code.str,
    name: name.str,
    credits: parseInt(credits.str),
    level: level.str,
    grade: grade.str,
    date: new Date(year, month - 1, day),
  };
};
