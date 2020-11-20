export const courseTypes = {
  Y: "yy",
  P: "pp",
  A: "aa",
  S: "ss",
  J: "jj",
  K: "kk",
  V: "vv",
  H: "hh",
  O: "oo",
};

export const toggleInArr = (arr, item) => {
  const index = arr.indexOf(item);

  if (index !== -1) {
    arr.splice(index, 1);
    arr = arr; // force update
  } else {
    arr = [...arr, item];
  }
};
