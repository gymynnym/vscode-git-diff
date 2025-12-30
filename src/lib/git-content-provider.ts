import vscode from 'vscode';
import cp from 'child_process';
import path from 'path';
import { GitCommand } from '../constants/git-command';

export class GitContentProvider implements vscode.TextDocumentContentProvider {
  async provideTextDocumentContent(uri: vscode.Uri, _token: vscode.CancellationToken): Promise<string> {
    const { fsPath, query: commitHash } = uri;
    const dir = path.dirname(fsPath);
    const filename = path.basename(fsPath);

    return new Promise((resolve, reject) => {
      cp.exec(GitCommand.SHOW(commitHash, filename), { cwd: dir }, (err, stdout, stderr) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(stdout);
      });
    });
  }
}
