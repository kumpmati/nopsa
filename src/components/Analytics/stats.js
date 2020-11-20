/**
 * Calculates the GPA of the given courses
 * @param {*} courses
 */
const gpa = (courses) => {
  const totalCredits = courses.reduce((sum, curr) => sum + curr.credits, 0);
  const weightedGrades = courses.reduce(
    (sum, curr) => sum + curr.credits * curr.grade,
    0
  );
  return weightedGrades / totalCredits;
};

export default {
  gpa,
};
