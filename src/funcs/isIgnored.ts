export function isIgnored(
  fileRelativePath: string,
  gitignoreLines: string[]
): boolean {
  if (!gitignoreLines[0]) {
    return false;
  }

  const parts = fileRelativePath.split("/");

  for (let i = 0; i < parts.length - 1; i++) {
    const folderPath = parts.slice(0, i + 1).join("/");
    if (
      gitignoreLines.includes(folderPath) ||
      gitignoreLines.includes(folderPath + "/")
    ) {
      return true;
    }
  }

  return gitignoreLines.includes(fileRelativePath);
}
