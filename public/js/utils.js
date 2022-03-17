const isContinuous = (arr) => {
  return !arr
    .map((s) => parseFloat(s[0]))
    .reduce((acc, cur, i, arr) => {
      if (cur - arr?.[i - 1] === 1 || !arr?.[i - 1]) {
        return acc;
      } else {
        return [...acc, cur];
      }
    }, []).length;
};

window.isContinuous = isContinuous;
