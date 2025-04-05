export function isIgnored(
  fileRelativePath: string,
  gitignoreLines: string[]
): boolean {
  const parts = fileRelativePath.split("/");

  // Vérifie chaque dossier parent (ex: test/, test/test_subfolder/)
  for (let i = 0; i < parts.length - 1; i++) {
    const folderPath = parts.slice(0, i + 1).join("/");
    if (
      gitignoreLines.includes(folderPath) ||
      gitignoreLines.includes(folderPath + "/")
    ) {
      return true;
    }
  }

  // Vérifie si le fichier lui-même est ignoré (exact match)
  return gitignoreLines.includes(fileRelativePath);
}