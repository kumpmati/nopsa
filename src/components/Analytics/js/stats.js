/**
 * Calculates the GPA of the given courses
 * @param {Array} courses
 */
const gpa = (courses) => {
  // calculate total credits (where the grade is a number)
  const totalCredits = courses.reduce(
    (sum, curr) => (parseInt(curr.grade) ? sum + curr.credits : sum),
    0
  );
  const weightedGrades = courses.reduce(
    (sum, curr) =>
      parseInt(curr.grade) ? sum + curr.credits * curr.grade : sum,
    0
  );

  return totalCredits > 0 ? (weightedGrades / totalCredits).toFixed(2) : "N/A";
};

/**
 * Calculates the most frequent property of every course
 * @param {Array} courses
 * @param {Function} func
 */
const mostFrequent = (courses, func) => {
  const arr = courses.slice(0, courses.length);
  const item = arr
    .sort(
      (a, b) =>
        arr.filter((v) => func(v) === func(a)).length -
        arr.filter((v) => func(v) === func(b)).length
    )
    .pop();
  return item ? func(item) : "N/A";
};

/**
 * Calculates the total number of credits
 * @param {*} courses
 */
const totalCredits = (courses) => {
  return courses.reduce((sum, curr) => sum + curr.credits, 0);
};

export default {
  gpa,
  mostFrequent,
  totalCredits,
};
