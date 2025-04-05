export function getFileRelativePath(
  filePath: string,
  workspaceRoot: string
): string[] {
  const reversedTreeStructure: string[] = filePath.split("\\").reverse();
  var fileRelativePath: string[] = [];
  var folderRelativePath: string[] = [];

  for (let i = 0; i <= reversedTreeStructure.length; i++) {
    if (reversedTreeStructure[i] != workspaceRoot) {
      fileRelativePath.push(reversedTreeStructure[i]);
    } else {
      break;
    }
  }

  for (let i = 1; i <= reversedTreeStructure.length; i++) {
    if (reversedTreeStructure[i] != workspaceRoot) {
      folderRelativePath.push(reversedTreeStructure[i]);
    } else {
      break;
    }
  }

  var fileAndFolderRelativePath: string[] = [
    fileRelativePath.reverse().join("/"),
    folderRelativePath.reverse().join("/"),
  ];

  return fileAndFolderRelativePath;
}
