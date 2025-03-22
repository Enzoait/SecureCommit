import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "securecommit" is now active!');

  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "securecommit.scanWorkspace",
    async () => {
      vscode.window.showInformationMessage("Scanning workspace...");
      const workspaceFolders: readonly vscode.WorkspaceFolder[] | undefined =
        vscode.workspace.workspaceFolders;
      if (workspaceFolders == undefined) {
        vscode.window.showInformationMessage(
          "No workspace found. You need to open a folder to use SecureCommit."
        );
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;
      console.log("Root Path: ", rootPath);

      const files: vscode.Uri[] = await vscode.workspace.findFiles(
        "**/*.{env,txt,c,cpp,cc,h,rs,go,java,kt,kts,scala,cs,py,rb,php,pl,pm,sh,js,mjs,ts,dart,ex,exs,erl,beam,hs,clj,cljs,cljc,fs,fsi,fsx}",
        "**/node_modules/**"
      );

      console.log("Number of files within the workspace: ", files.length);

      for (const file of files) {
        const filePath = file.fsPath;

        try {
          const content = fs.readFileSync(filePath, "utf-8");

          console.log(`File: ${filePath}`);
          console.log(`Content:\n${content.substring(0, 200)}...`);
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
        }
      }

      vscode.window.showInformationMessage("Workspace scan completed!");
    }
  );

  /*
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "securecommit.secureCommit",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("SecureCommit is operational.");
      vscode.workspace
        .openTextDocument("C:\\Users\\enzoa\\OneDrive\\Documents\\test.js")
        .then((doc) => {
          console.log("Text content : ", doc.getText());
        });
    }
  );*/

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
