import * as vscode from "vscode";
import * as fs from "fs";
import { getFolders } from "../funcs/getFolders";
import { getFileRelativePath } from "../funcs/getFileRelativePath";
import { isIgnored } from "../funcs/isIgnored";

export class FileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<
    vscode.Uri | vscode.Uri[] | undefined
  >();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  private _flaggedFilesAndFolders = new Set<string>();
  private _flaggedFilesWithoutFolders = new Set<string>();

  provideFileDecoration(
    uri: vscode.Uri
  ): vscode.ProviderResult<vscode.FileDecoration> {
    if (this._flaggedFilesAndFolders.has(uri.fsPath)) {
      return {
        badge: "🔑",
        color: new vscode.ThemeColor("securecommit.customPurple"),
        tooltip:
          "Secure Commit : This file contains sensitive information. Consider checking for any secrets that shouldn't be committed.",
      };
    }
    return undefined;
  }

  refreshAndGetFlaggedFiles(
    files: vscode.Uri[],
    gitignore: string,
    workspaceRoot: string,
    activeWorkspacePath: string
  ): Set<string> {
    // Sauvegarde l'ancien état
    const previousFlaggedFilesAndFolders = new Set(
      this._flaggedFilesAndFolders
    );
    this._flaggedFilesAndFolders.clear();
    const previousFlaggedFilesWithoutFolders = new Set(
      this._flaggedFilesWithoutFolders
    );
    this._flaggedFilesWithoutFolders.clear();

    let sensitiveFiles = 0;
    let flaggedFoldersList = new Set<vscode.Uri>();

    var gitignoreContent: string;
    if (gitignore != "null") {
      gitignoreContent = fs.readFileSync(gitignore, "utf-8");
    } else {
      gitignoreContent = gitignore;
    }

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.fsPath, "utf-8");

        var fileAndFolderRelativePath: string[] = getFileRelativePath(
          file.fsPath,
          workspaceRoot
        );

        var fileRelativePath = fileAndFolderRelativePath[0];
        var gitignoreLines : string[];
        if (gitignoreContent != "null"){
          gitignoreLines = gitignoreContent
            .split(/\r?\n/) // Split par ligne
            .map((line) => line.trim()) // Supprime les espaces inutiles
            .filter((line) => line && !line.startsWith("#")); // Ignore lignes vides et commentaires
        }
        else {
          gitignoreLines = []
        }

        if (
          content.includes("secure-commit") &&
          !isIgnored(fileRelativePath, gitignoreLines)
        ) {
          this._flaggedFilesAndFolders.add(file.fsPath);
          flaggedFoldersList = getFolders(
            file.fsPath,
            workspaceRoot,
            activeWorkspacePath
          );

          for (let folder of flaggedFoldersList) {
            this._flaggedFilesAndFolders.add(folder.fsPath);
          }
          sensitiveFiles++;
          this._flaggedFilesWithoutFolders.add(file.fsPath);
        }
      } catch (error) {
        console.error(`Error reading file ${file.fsPath}:`, error);
      }
    }

    if (sensitiveFiles > 0) {
      vscode.window.showWarningMessage(
        `Secure Commit : Workspace scan completed! Found ${sensitiveFiles} sensitive files. Find more info in SECURE_COMMIT_FLAGGED_FILES.md`
      );
    } else {
      vscode.window.showInformationMessage(
        `Secure Commit : Workspace scan completed! There are no sensitive files in the workspace.`
      );
    }

    // Récupèration des fichiers qui n'ont plus "secure-commit"
    const removedFilesAndFolders = new Set(
      [...previousFlaggedFilesAndFolders].filter(
        (f) => !this._flaggedFilesAndFolders.has(f)
      )
    );
    const removedFilesWithoutFolders = new Set(
      [...previousFlaggedFilesWithoutFolders].filter(
        (f) => !this._flaggedFilesWithoutFolders.has(f)
      )
    );

    // Les URI a rafraichir
    const urisToRefresh = new Set<vscode.Uri>();

    this._flaggedFilesAndFolders.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    removedFilesAndFolders.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    this._flaggedFilesWithoutFolders.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    removedFilesWithoutFolders.forEach((filePath) => {
      urisToRefresh.add(vscode.Uri.file(filePath));
    });

    this._onDidChangeFileDecorations.fire(Array.from(urisToRefresh));

    return this._flaggedFilesWithoutFolders;
  }
}
