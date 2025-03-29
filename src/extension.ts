import * as vscode from "vscode";
import packageJson from "../package.json";
import { FileDecorationProvider } from "./providers/FileDecorationProvider";
import { fileExtensions } from "./constants/FileConstants";

export function activate(context: vscode.ExtensionContext) {
  console.log('"securecommit" is now active!');

  var provider = new FileDecorationProvider();
  vscode.window.registerFileDecorationProvider(provider);

  const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined =
    vscode.workspace.workspaceFolders;
  if (workspaceFolders == undefined) {
    vscode.window.showInformationMessage(
      "No workspace found. You need to open a folder to use SecureCommit."
    );
    return;
  }

  const activeWorkspacePath: string = workspaceFolders[0].uri.fsPath;

  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "securecommit.scanWorkspace",
    async () => {
      vscode.window.showInformationMessage(
        "Secure Commit : Scanning workspace..."
      );
      
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
    async () => {
      vscode.window.showInformationMessage(
        `Secure Commit version : ${packageJson.version}`
      );

      console.log("TEST TEST : ", workspaceFolders[0].uri.toString());

      const summaryFileUri : vscode.Uri = vscode.Uri.parse(`${workspaceFolders[0].uri.toString()}/SECURE_COMMIT_FLAGGED_FILES.txt`);

      const text = "salut test 123";
      const content: Uint8Array = new TextEncoder().encode(text);

      console.log("URIIII", summaryFileUri.toString());
      
      vscode.workspace.fs.writeFile(summaryFileUri, content);
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}