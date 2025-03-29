import * as vscode from "vscode";

export function getWorkspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
  const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined =
    vscode.workspace.workspaceFolders;
  if (workspaceFolders == undefined) {
    vscode.window.showInformationMessage(
      "No workspace found. You need to open a folder to use SecureCommit."
    );
    return;
  }
  return workspaceFolders;
}