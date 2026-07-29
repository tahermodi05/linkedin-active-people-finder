export const searchPeople = async ({ keyword }) => {
  return {
    people: [
      {
        id: 1,
        name: "John Doe",
        headline: `Senior ${keyword}`,
      },
      {
        id: 2,
        name: "Jane Smith",
        headline: "Frontend Engineer",
      },
    ],
  };
};