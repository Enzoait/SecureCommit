import * as vscode from "vscode";

export function getFolders(
  filePath: string,
  workspaceRoot: string,
  activeWorkspacePath: string
): Set<vscode.Uri> {
  
  const reversedTreeStructure: string[] = filePath.split("\\").reverse();
  var reversedFolderPath: string[] = [];
  var folderPathsList: Set<vscode.Uri> = new Set<vscode.Uri>();

  for (let i = 1; i <= reversedTreeStructure.length; i++) {
    if (reversedTreeStructure[i] != workspaceRoot) {
      reversedFolderPath.push(reversedTreeStructure[i]);
    } else {
      break;
    }
  }

  reversedFolderPath.reverse().forEach((folder) => {
    activeWorkspacePath += `\\${folder}`;
    folderPathsList.add(vscode.Uri.file(activeWorkspacePath));
  });

  return folderPathsList;
}
