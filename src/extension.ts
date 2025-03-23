import * as vscode from "vscode";
import { FileDecorationProvider } from "./providers/FileDecorationProvider";

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

      const files: vscode.Uri[] = await vscode.workspace.findFiles(
        "**/*.{env,txt,c,cpp,cc,h,rs,go,java,kt,kts,scala,cs,py,rb,php,pl,pm,sh,js,mjs,ts,dart,ex,exs,erl,beam,hs,clj,cljs,cljc,fs,fsi,fsx}",
        "**/node_modules/**"
      );

      provider.refresh(files);
    }
  );

  const disposable2 = vscode.commands.registerCommand(
    "securecommit.secureCommit",
    () => {
      vscode.window.showInformationMessage(
        "Secure Commit version : 0.1"
      );
    }
  );

  context.subscriptions.push(disposable);
  context.subscriptions.push(disposable2);
}

export function deactivate() {}