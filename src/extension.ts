import * as vscode from "vscode";
import packageJson from "../package.json";
import { FileDecorationProvider } from "./providers/FileDecorationProvider";
import { fileExtensions } from "./constants/FileConstants";
import { getWorkspaceFolders } from "./funcs/getWorkspacefolders";
import { writeFlaggedFilesPathsInSummaryFile } from "./funcs/writeFlaggedFilesPathsInSummaryFile";
import { copyFileSync } from "fs";

export function activate(context: vscode.ExtensionContext) {
  console.log('"securecommit" is now active!');

  var provider = new FileDecorationProvider();
  vscode.window.registerFileDecorationProvider(provider);

  const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined =
    getWorkspaceFolders();

  if (workspaceFolders == undefined) return;

  const activeWorkspacePath: string = workspaceFolders[0].uri.fsPath;

  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "securecommit.scanWorkspace",
    async () => {
      vscode.window.showInformationMessage(
        "Secure Commit : Scanning workspace..."
      );

      const workspaceRoot: string = activeWorkspacePath
        .split("\\")
        .reverse()[0];

      console.log(`Root : ${workspaceRoot}`);

      const files: vscode.Uri[] = await vscode.workspace.findFiles(
        `**/*.{${fileExtensions}}`,
        "**/node_modules/**"
      );

      const gitignore: vscode.Uri[] = await vscode.workspace.findFiles(
        `**/.gitignore`
      );

      var flaggedFiles: Set<string>;

      if (!gitignore[0]) {
        flaggedFiles = provider.refreshAndGetFlaggedFiles(
          files,
          "null",
          workspaceRoot,
          activeWorkspacePath
        );
      } else {
        flaggedFiles = provider.refreshAndGetFlaggedFiles(
          files,
          gitignore[0].fsPath,
          workspaceRoot,
          activeWorkspacePath
        );
      }
      writeFlaggedFilesPathsInSummaryFile(flaggedFiles, workspaceFolders);
    }
  );

  const disposable2 = vscode.commands.registerCommand(
    "securecommit.secureCommit",
    async () => {
      vscode.window.showInformationMessage(
        `Secure Commit version : ${packageJson.version}`
      );
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}
