import * as vscode from "vscode";
import * as fs from "fs";

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
        tooltip: "Secure Commit : This file contains sensitive information.",
      };
    }
    return undefined;
  }

  refresh(
    files : vscode.Uri[]
  ): void {

    var sensitiveFiles : number = 0;

    for (const file of files) {
      const content = fs.readFileSync(file.fsPath, "utf-8");

      try {
        console.log(`File: ${file.fsPath}`);
        console.log(`Content:\n${content.substring(0, 200)}`);

        if (content.includes("secure-commit")) {
          this._flaggedFiles.add(file.fsPath);
          sensitiveFiles++;
        }
        else if (this._flaggedFiles.has(file.fsPath)) {
          this._flaggedFiles.delete(file.fsPath);
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

    this._onDidChangeFileDecorations.fire(files);
  }
}
