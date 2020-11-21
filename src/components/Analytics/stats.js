/**
 * Calculates the GPA of the given courses
 * @param {*} courses
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

export default {
  gpa,
};
