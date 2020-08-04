
export const frequencyToNumDaysMap = {
  'daily': 1,
  'weekly': 7,
  'monthly': 30,
  'quarterly': 90,
  'annually': 365,
};

export const envAssert = (varName) => {
  console.assert(process.env[varName],`Warning Environment Varaible ${varName} doesn't exist.`);
  if (process.env[varName]) return true;
  else return false;
};

export const ANONYMOUS_PLACEHOLDER:string = `(anonymous)`;
