export const studyLevels = {
  Y: "General Studies",
  P: "Basic Studies",
  A: "Intermediate Studies",
  S: "Advanced Studies",
  J: "Postgraduate Studies",
  K: "Language Studies",
  V: "Preparatory Studies",
  H: "Practical Training",
  O: "Study Module",
};

export const toggleInArr = (arr, item) => {
  const index = arr.indexOf(item);

  if (index !== -1) {
    arr.splice(index, 1);
  } else {
    arr.push(item);
  }

  return arr;
};
