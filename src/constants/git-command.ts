export const GitCommand = {
  LOG: (filename: string) => `git log --pretty=format:"%h|%ad|%s" --date=short -- "${filename}"`,
  SHOW: (commitHash: String, filename: string) => `git show ${commitHash}:./${filename}`,
};
