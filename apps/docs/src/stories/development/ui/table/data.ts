export const users: Record<number, string> = {
  1: "Alice Johnson",
  2: "Bob Smith",
  3: "Charlie Davis",
  4: "Diana Prince",
  5: "Edward Norton",
  6: "Fiona Gallagher",
  7: "George Miller",
  8: "Hannah Abbott",
  9: "Ian Wright",
  10: "Julia Roberts",
};

export const todos = Array.from({ length: 20 }, (_, index) => ({
  id: index + 1,
  userId: (index % 10) + 1,
  title: `Task ${index + 1}`,
  completed: index % 3 === 0,
}));
