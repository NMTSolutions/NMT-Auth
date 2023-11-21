export const getCountryDetails = (country: string) => {
  switch (country) {
    case "India":
      return ["IN", "Asia Pacific"];
    default:
      return [null, null];
  }
};
