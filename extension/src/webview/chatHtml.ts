export function getChatHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body {
      font-family: var(--vscode-font-family);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      margin: 0;
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    #messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .msg {
      padding: 10px;
      border-radius: 8px;
      max-width: 90%;
      white-space: pre-wrap;
    }
    .user { align-self: flex-end; background: #005a9e44; }
    .assistant { align-self: flex-start; background: #2d2d3044; }
    .typing { font-style: italic; opacity: 0.8; }
    #composer {
      display: flex;
      border-top: 1px solid var(--vscode-panel-border);
      padding: 10px;
      gap: 8px;
    }
    textarea {
      flex: 1;
      resize: none;
      min-height: 42px;
      max-height: 140px;
      border-radius: 6px;
      border: 1px solid var(--vscode-input-border);
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      padding: 8px;
    }
    button {
      border: none;
      border-radius: 6px;
      padding: 0 14px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      cursor: pointer;
    }
    #error {
      color: #f48771;
      padding: 0 10px 10px;
      display: none;
    }
  </style>
</head>
<body>
  <div id="messages"></div>
  <div id="error"></div>
  <div id="composer">
    <textarea id="input" placeholder="Escribe tu mensaje..."></textarea>
    <button id="send">Enviar</button>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    const messages = document.getElementById('messages');
    const input = document.getElementById('input');
    const send = document.getElementById('send');
    const error = document.getElementById('error');

    function appendMessage(role, content, clsExtra = '') {
      const el = document.createElement('div');
      el.className = 'msg ' + role + ' ' + clsExtra;
      el.textContent = content;
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;
      return el;
    }

    function showError(msg) {
      error.style.display = 'block';
      error.textContent = msg;
    }

    function clearError() {
      error.style.display = 'none';
      error.textContent = '';
    }

    let typingEl = null;

    send.addEventListener('click', () => {
      const text = input.value.trim();
      if (!text) return;
      clearError();
      appendMessage('user', text);
      typingEl = appendMessage('assistant', 'IA escribiendo...', 'typing');
      vscode.postMessage({ type: 'chat', text });
      input.value = '';
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        send.click();
      }
    });

    window.addEventListener('message', (event) => {
      const msg = event.data;
      if (msg.type === 'chatResponse') {
        if (typingEl) typingEl.remove();
        appendMessage('assistant', msg.text);
      }
      if (msg.type === 'error') {
        if (typingEl) typingEl.remove();
        showError(msg.text);
      }
    });
  </script>
</body>
</html>`;
}
