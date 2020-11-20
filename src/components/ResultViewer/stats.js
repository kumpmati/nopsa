/**
 * Calculates the GPA of the given courses
 * @param {*} courses
 */
const gpa = (courses) => {
  const totalPoints = courses.reduce((sum, curr) => sum + curr.points, 0);
  const weightedGrades = courses.reduce(
    (sum, curr) => sum + curr.points * curr.grade,
    0
  );
  return weightedGrades / totalPoints;
};

export default {
  gpa,
};
