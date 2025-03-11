import * as vscode from 'vscode'
import { exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import { importStatementRegex } from './regex'

async function findPackageJsonDir(startDir: string): Promise<string | null> {
  let currentDir = startDir

  while (true) {
    const packageJsonPath = path.join(currentDir, 'package.json')
    if (fs.existsSync(packageJsonPath)) {
      return currentDir
    }

    const parentDir = path.dirname(currentDir)
    if (parentDir === currentDir) {
      return null
    }
    currentDir = parentDir
  }
}

// TODO memoize this maybe?
function getTypescriptModuleImportErrorsInRange(
  document: vscode.TextDocument,
  range: vscode.Range
): vscode.Diagnostic | undefined {
  const diagnostics = vscode.languages.getDiagnostics(document.uri)

  return diagnostics.find((diagnostic) => {
    return (
      diagnostic.range.intersection(range) &&
      diagnostic.severity === vscode.DiagnosticSeverity.Error &&
      diagnostic.code === 2307
    ) // Cannot find module
  })
}
const commandName = 'install-dependency-code-action.installDependency'

export function activate(context: vscode.ExtensionContext) {
  const installDependency = vscode.commands.registerCommand(
    commandName,
    async (moduleName: string, isDev: boolean = false) => {
      try {
        const editor = vscode.window.activeTextEditor
        if (!editor) {
          vscode.window.showErrorMessage('No active editor is open.')
          return
        }

        const document = editor.document
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(
          document.uri
        )
        if (!workspaceFolder) {
          vscode.window.showErrorMessage('No workspace folder is open.')
          return
        }

        const workspacePath = workspaceFolder.uri.fsPath
        let packageManager = 'pnpm'

        if (fs.existsSync(path.join(workspacePath, 'pnpm-lock.yaml'))) {
          packageManager = 'pnpm'
        } else if (fs.existsSync(path.join(workspacePath, 'yarn.lock'))) {
          packageManager = 'yarn'
        } else if (fs.existsSync(path.join(workspacePath, 'bun.lockb'))) {
          packageManager = 'bun'
        } else if (
          fs.existsSync(path.join(workspacePath, 'package-lock.json'))
        ) {
          packageManager = 'npm'
        }

        const packageJsonDir = await findPackageJsonDir(
          path.dirname(document.uri.fsPath)
        )
        if (!packageJsonDir) {
          vscode.window.showErrorMessage(
            'No package.json found in the workspace hierarchy.'
          )
          return
        }

        const installFlag = isDev ? ' --save-dev' : ''

        exec(
          `${packageManager} install${installFlag} ${moduleName}`,
          { cwd: packageJsonDir },
          (error, stdout, stderr) => {
            if (error) {
              vscode.window.showErrorMessage(
                `Failed to install ${moduleName}: ${stderr}`
              )
            } else {
              vscode.window.showInformationMessage(
                `Successfully installed ${moduleName}${isDev ? ' as dev dependency' : ''}: ${stdout}`
              )
            }
          }
        )
      } catch (error) {
        vscode.window.showErrorMessage(
          `Failed to install ${moduleName}: ${error}`
        )
      }
    }
  )

  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      ['typescript', 'javascript', 'typescriptreact', 'javascriptreact'],
      new MissingDependencyCodeActionProvider(),
      {
        providedCodeActionKinds:
          MissingDependencyCodeActionProvider.providedCodeActionKinds
      }
    )
  )

  context.subscriptions.push(installDependency)
}

class MissingDependencyCodeActionProvider implements vscode.CodeActionProvider {
  public static readonly providedCodeActionKinds = [
    vscode.CodeActionKind.QuickFix
  ]

  public async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
  ) {
    const moduleImportErrorDiagnostic = getTypescriptModuleImportErrorsInRange(
      document,
      range
    )

    if (!moduleImportErrorDiagnostic) {
      return // No need to provide code actions if there are no TypeScript errors
    }
    const line = document.lineAt(range.start.line)
    const match = line.text.match(importStatementRegex)

    if (!match) {
      return
    }

    const moduleName = match[1]
    const isInstalled = await this.isModuleInstalled(document, moduleName)

    if (!isInstalled) {
      return this.createInstallDependencyCodeActions(
        moduleName,
        moduleImportErrorDiagnostic
      )
    }
    return
  }

  private createInstallDependencyCodeActions(
    moduleName: string,
    diagnostic: vscode.Diagnostic
  ): vscode.CodeAction[] {
    const regularDepAction = new vscode.CodeAction(
      `Install dependency: ${moduleName}`,
      vscode.CodeActionKind.QuickFix
    )
    regularDepAction.isPreferred = true
    regularDepAction.diagnostics = [diagnostic]
    regularDepAction.command = {
      command: commandName,
      title: `Install ${moduleName}`,
      arguments: [moduleName, false]
    }

    const devDepAction = new vscode.CodeAction(
      `Install dev dependency: ${moduleName}`,
      vscode.CodeActionKind.QuickFix
    )
    devDepAction.diagnostics = [diagnostic]
    devDepAction.command = {
      command: commandName,
      title: `Install ${moduleName} as dev dependency`,
      arguments: [moduleName, true]
    }

    return [regularDepAction, devDepAction]
  }

  private isModuleInstalled(
    document: vscode.TextDocument,
    moduleName: string
  ): Promise<boolean> {
    return new Promise((resolve) => {
      let currentDir = path.dirname(document.uri.fsPath)

      while (true) {
        const packageJsonPath = path.join(currentDir, 'package.json')
        if (fs.existsSync(packageJsonPath)) {
          try {
            const packageJson = JSON.parse(
              fs.readFileSync(packageJsonPath, 'utf8')
            )
            const dependencies = packageJson.dependencies || {}
            const devDependencies = packageJson.devDependencies || {}
            resolve(moduleName in dependencies || moduleName in devDependencies)
            return
          } catch (error) {
            vscode.window.showWarningMessage(
              `Failed to read package.json: ${error}`
            )
            resolve(false)
            return
          }
        }

        const parentDir = path.dirname(currentDir)
        if (parentDir === currentDir) {
          resolve(false)
          return
        }
        currentDir = parentDir
      }
    })
  }
}

export function deactivate() {}
