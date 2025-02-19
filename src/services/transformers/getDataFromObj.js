const getDataFromObj = (obj, search) => {
  if (!obj || !Array.isArray(search) || search.length === 0) return undefined;

  let output;
  for (let searchEl of search) {
    if (obj[searchEl] !== undefined) {
      if (typeof obj[searchEl] === "string") {
        return obj[searchEl];
      } else {
        output = getDataFromObj(obj[searchEl], search.slice(1));
        if (output !== undefined) {
          return output;
        }
      }
    }
  }
  return output;
};

export default getDataFromObj;
