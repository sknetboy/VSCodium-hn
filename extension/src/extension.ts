import * as vscode from "vscode";
import { BackendClient } from "./httpClient";
import { getChatHtml } from "./webview/chatHtml";

function getClient(): BackendClient {
  const config = vscode.workspace.getConfiguration("localAiAssistant");
  const backendUrl = config.get<string>("backendUrl", "http://127.0.0.1:4000");
  return new BackendClient(backendUrl);
}

export function activate(context: vscode.ExtensionContext): void {
  let panel: vscode.WebviewPanel | undefined;

  const openChat = vscode.commands.registerCommand("localAiAssistant.openChat", () => {
    if (panel) {
      panel.reveal(vscode.ViewColumn.Beside);
      return;
    }

    panel = vscode.window.createWebviewPanel(
      "localAiAssistant.chat",
      "Local AI Assistant",
      vscode.ViewColumn.Beside,
      {
        enableScripts: true
      }
    );

    panel.webview.html = getChatHtml();

    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.type !== "chat") {
          return;
        }

        try {
          const response = await getClient().chat(message.text);
          panel?.webview.postMessage({ type: "chatResponse", text: response.reply });
        } catch (error) {
          const text = error instanceof Error ? error.message : String(error);
          panel?.webview.postMessage({ type: "error", text: `Error al consultar backend: ${text}` });
        }
      },
      undefined,
      context.subscriptions
    );

    panel.onDidDispose(() => {
      panel = undefined;
    });
  });

  const editWithAi = vscode.commands.registerCommand("localAiAssistant.editWithAi", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage("No hay un editor activo.");
      return;
    }

    const selected = editor.document.getText(editor.selection);
    if (!selected.trim()) {
      vscode.window.showInformationMessage("Selecciona código para editar con IA.");
      return;
    }

    try {
      const result = await getClient().completion(selected);
      await editor.edit((builder) => {
        builder.replace(editor.selection, result.completion);
      });
      vscode.window.showInformationMessage("Edición IA aplicada.");
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      vscode.window.showErrorMessage(`Falló edición con IA: ${text}`);
    }
  });

  const inlineProvider: vscode.InlineCompletionItemProvider = {
    async provideInlineCompletionItems(document, position) {
      const linePrefix = document.lineAt(position.line).text.slice(0, position.character);

      if (!linePrefix.trim()) {
        return { items: [] };
      }

      try {
        const result = await getClient().completion(linePrefix);
        const range = new vscode.Range(position, position);
        return {
          items: [new vscode.InlineCompletionItem(result.completion, range)]
        };
      } catch {
        return { items: [] };
      }
    }
  };

  const inlineRegistration = vscode.languages.registerInlineCompletionItemProvider({ pattern: "**" }, inlineProvider);

  context.subscriptions.push(openChat, editWithAi, inlineRegistration);
}

export function deactivate(): void {
  // No-op
}
