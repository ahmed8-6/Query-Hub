const blacklist = new Set<string>();

const addToBlacklist = (token: string): void => {
  blacklist.add(token);
};

const isBlacklisted = (token: string): boolean => {
  return blacklist.has(token);
};

export { addToBlacklist, isBlacklisted };
