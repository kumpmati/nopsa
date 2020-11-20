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
        const parsedData = await parse(reader.result);
        resolve(parsedData);
      } catch (parseErr) {
        reject(parseErr);
      }
    };

    // reads file contents as base64
    reader.readAsDataURL(file);
  });
}

/**
 * Parses the PDF file for course info
 * @param {String} data
 */
async function parse(data) {
  // parse PDF document from base64 data
  const loadingTask = pdfjsLib.getDocument(data);
  const pdf = await loadingTask.promise;

  let result = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    await pdf.getPage(pageNum).then(async (page) => {
      const items = (await page.getTextContent()).items; // array of all text items on page

      getItemIndexes(items, courseNumberRegexp).forEach((i) => {
        result.push(getCourseDetails(items, i));
      });
    });
  }

  return result;
}

const getItemIndexes = (items, pattern) =>
  items.reduce((arr, item) => {
    if (pattern.test(item.str)) {
      arr.push(items.indexOf(item));
    }
    return arr;
  }, []);

/**
 * Returns all the available details for a course based on the given index.
 * @param {*} items Array of PDF text items
 * @param {*} index Index of the course code in the array
 */
const getCourseDetails = (items, index) => {
  const [code, name, credits, type, grade, date] = items.slice(
    index,
    index + 6
  );

  const [day, month, year] = date.str.split(".");

  return {
    code: code.str,
    name: name.str,
    credits: parseInt(credits.str),
    type: type.str,
    grade: grade.str,
    date: new Date(year, month - 1, day),
  };
};

/*
 * Regular expressions used to find specific items
 */
const courseNumberRegexp = /\w{4}\d{4}/;
