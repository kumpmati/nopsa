/**
 * Used to filter courses based on ResultViewerSettings settings
 * @param {object} course Course
 * @param {object} settings Settings used to filter courses
 */
export default function courseFilter(course, settings) {
  // filter course by grade type
  switch (settings.grades) {
    case "all":
    default:
      break;

    case "numeric":
      if (!parseInt(course.grade)) return false;
      break;

    case "pass-fail":
      if (parseInt(course.grade)) return false;
      break;
  }

  // filter by date
  const { start, end } = settings.date_range;
  if (course.date <= new Date(start) || course.date >= new Date(end)) {
    return false;
  }

  // filter by course level
  if (settings.study_levels.length > 0) {
    if (!settings.study_levels.includes(course.level)) return false;
  }

  // TODO: more filters
  return true;
}
