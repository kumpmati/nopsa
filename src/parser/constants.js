// Matches the standard UTU course codes (e.g. DTEK1095 / DTE20025 / TKO_2085)
export const courseCodeRegexp = /^([a-öA-Ö]{4}\d{4}|[a-öA-Ö]{2,3}_{1,2}\d{4}|[a-öA-Ö]{3}\d{5})$/;

// Matches the date associated with a course (dd.mm.yyyy)
export const dateRegexp = /^\d{2}\.\d{2}\.\d{4}$/;
