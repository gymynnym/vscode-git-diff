import vscode from 'vscode';
import { openChange } from './commands';
import { GitContentProvider } from './lib/git-content-provider';

export function activate(context: vscode.ExtensionContext) {
  const registration = vscode.workspace.registerTextDocumentContentProvider('git-content', new GitContentProvider());
  const disposables = [registration, vscode.commands.registerCommand('vscode-git-diff.openChange', openChange)];

  disposables.forEach((disposable) => context.subscriptions.push(disposable));
}

export function deactivate() {}
