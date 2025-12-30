import vscode from 'vscode';
import cp from 'child_process';
import util from 'util';
import path from 'path';
import { ErrorMessage } from '../constants/message';
import { GitCommand } from '../constants/git-command';

const execAsync = util.promisify(cp.exec);

async function openChange() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage(ErrorMessage.NO_ACTIVE_EDITOR);
    return;
  }

  const { fsPath } = editor.document.uri;
  const [dir, filename] = [path.dirname(fsPath), path.basename(fsPath)];

  try {
    const { stdout } = await execAsync(GitCommand.LOG(filename), { cwd: dir });
    const logs = extractLogFromStdout(stdout);
    if (logs.length === 0) {
      vscode.window.showInformationMessage(ErrorMessage.NO_COMMIT_LOGS);
      return;
    }

    const selected = await vscode.window.showQuickPick(logs, {
      placeHolder: 'Select a commit to view the diff',
      ignoreFocusOut: true,
      matchOnDescription: true,
    });
    if (!selected || !selected.description) {
      return;
    }

    const { description: commitHash } = selected;
    const [leftUri, rightUri] = parseUris(fsPath, commitHash, editor);
    const title = `${filename} (${commitHash} vs Current)`;
    await vscode.commands.executeCommand('vscode.diff', leftUri, rightUri, title);
  } catch (err) {
    console.error(err);
    vscode.window.showErrorMessage(ErrorMessage.GIT_COMMAND_FAILED);
  }
}

function extractLogFromStdout(stdout: string): vscode.QuickPickItem[] {
  return stdout
    .split('\n')
    .filter((line) => line.trim() !== '') // Remove empty lines
    .map((line) => {
      const parts = line.split('|');
      const [hash, date] = parts;
      const message = parts.slice(2).join('|'); // Preserve '|' in commit messages
      return {
        label: `$(git-commit) ${message} (${date})`,
        description: `${hash}`,
        picked: false,
      } satisfies vscode.QuickPickItem;
    });
}

function parseUris(fsPath: string, commitHash: string, editor: vscode.TextEditor) {
  const leftUri = vscode.Uri.file(fsPath).with({
    scheme: 'git-content',
    query: commitHash,
  });
  const rightUri = editor.document.uri;
  return [leftUri, rightUri];
}

export { openChange };
