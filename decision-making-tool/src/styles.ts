export function applyStyles(): void {
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    body {
      margin: 0 auto;
      font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
      padding: 20px;
      color: #ffffffde;
      display: flex;
      flex-direction: column;
      align-items: center;
      max-width: 900px;
      background-color: #242424;
    }
    .app-name {
      font-size: 2em;
      margin-bottom: 10px;
    }

    .options-table {
      display: table;
      width: 100%;
      border-collapse: collapse;
    }
    .option-row {
      display: table-row;
    }
    .option-cell {
      display: table-cell;
      padding: 5px 10px;
      border: 1px solid #ccc;
      text-align: center;
    }
    .buttons-panel {
      margin-top: 20px;
      display: flex;
      width: 100%;
      justify-content: space-between;
    }
    .button {
      padding: 5px 10px;
      cursor: pointer;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal {
      background: #0095ff4d;
      padding: 20px;
      border-radius: 4px;
      min-width: 300px;
      position: relative;
    }
    .modal-close {
      position: absolute;
      top: 5px;
      right: 10px;
      cursor: pointer;
    }
    .buttonsContainer {
      margin-top: 20px;
      display: flex;
      width: 100%;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .ErrorText {
      margin-bottom: 20px;
    }
  `;
  document.head.appendChild(styleEl);
}
