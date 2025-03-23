import * as vscode from "vscode";
import packageJson from "../package.json";
import { FileDecorationProvider } from "./providers/FileDecorationProvider";
import { fileExtensions } from "./constants/FileConstants";

export function activate(context: vscode.ExtensionContext) {
  console.log('"securecommit" is now active!');

  var provider = new FileDecorationProvider();
  vscode.window.registerFileDecorationProvider(provider);

  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "securecommit.scanWorkspace",
    async () => {
      vscode.window.showInformationMessage(
        "Secure Commit : Scanning workspace..."
      );
      const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined =
        vscode.workspace.workspaceFolders;
      if (workspaceFolders == undefined) {
        vscode.window.showInformationMessage(
          "No workspace found. You need to open a folder to use SecureCommit."
        );
        return;
      }

      const activeWorkspacePath : string = workspaceFolders[0].uri.fsPath;
      const workspaceRoot : string = activeWorkspacePath.split("\\").reverse()[0]

      console.log(`Root : ${workspaceRoot}`);

      const files: vscode.Uri[] = await vscode.workspace.findFiles(
        `**/*.{${fileExtensions}}`,
        "**/node_modules/**"
      );

      provider.refresh(files, workspaceRoot, activeWorkspacePath);
    }
  );

  const disposable2 = vscode.commands.registerCommand(
    "securecommit.secureCommit",
    () => {
      vscode.window.showInformationMessage(
        `Secure Commit version : ${packageJson.version}`
      );
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}