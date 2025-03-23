import * as vscode from "vscode";
import * as fs from "fs";
import { getFolders } from "../funcs/getFolders";

export class FileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<
    vscode.Uri | vscode.Uri[] | undefined
  >();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  private _flaggedFiles = new Set<string>();

  provideFileDecoration(
    uri: vscode.Uri
  ): vscode.ProviderResult<vscode.FileDecoration> {
    if (this._flaggedFiles.has(uri.fsPath)) {
      return {
        badge: "⚠️",
        color: new vscode.ThemeColor("errorForeground"),
        tooltip:
          "Secure Commit : This file contains sensitive information. Consider checking for any secrets that shouldn't be committed.",
      };
    }
    return undefined;
  }

  refresh(
    files: vscode.Uri[],
    workspaceRoot: string,
    activeWorkspacePath: string
  ): void {
    const previousFlaggedFiles = new Set(this._flaggedFiles); // Sauvegarde l'ancien état
    this._flaggedFiles.clear();

    let sensitiveFiles = 0;
    let flaggedFoldersList = new Set<vscode.Uri>();

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fsPath, "utf-8");

        if (content.includes("secure-commit")) {
          this._flaggedFiles.add(file.fsPath);
          flaggedFoldersList = getFolders(
            file.fsPath,
            workspaceRoot,
            activeWorkspacePath
          );

          for (let folder of flaggedFoldersList) {
            this._flaggedFiles.add(folder.fsPath);
          }
          sensitiveFiles++;
        }
      } catch (error) {
        console.error(`Error reading file ${file.fsPath}:`, error);
      }
    }

    if (sensitiveFiles > 0) {
      vscode.window.showWarningMessage(
        `Secure Commit : Workspace scan completed! Found ${sensitiveFiles} sensitive files.`
      );
    } else {
      vscode.window.showInformationMessage(
        `Secure Commit : Workspace scan completed! There are no sensitive files in the workspace.`
      );
    }

    // Récupèration des fichiers qui n'ont plus "secure-commit"
    const removedFiles = new Set(
      [...previousFlaggedFiles].filter((f) => !this._flaggedFiles.has(f))
    );

    // Les URI a rafraichir
    const urisToRefresh = new Set<vscode.Uri>();

    this._flaggedFiles.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    removedFiles.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    this._onDidChangeFileDecorations.fire(Array.from(urisToRefresh));
  }
}
