import type { Router } from '../router';
import { createEl } from '../utils';
import {
  loadOptions,
  saveOptions,
  loadCounter,
  saveCounter,
  resetCounter,
} from '../storage';
import type { Option } from '../models';

function isOption(item: unknown): item is Option {
  if (typeof item !== 'object' || item === null) return false;
  const id = Reflect.get(item, 'id');
  const title = Reflect.get(item, 'title');
  const weight = Reflect.get(item, 'weight');
  return (
    typeof id === 'string' &&
    typeof title === 'string' &&
    (typeof weight === 'number' || weight === '')
  );
}

export function renderListOptions(router: Router): void {
  const appName = createEl({
    tagName: 'div',
    className: 'app-name',
    textContent: 'Decision Making Tool',
  });
  document.body.appendChild(appName);

  const optionsTable = createEl({ tagName: 'div', className: 'options-table' });
  document.body.appendChild(optionsTable);

  let options: Option[] = loadOptions();

  const headerRow = createEl({ tagName: 'div', className: 'option-row' });
  ['ID', 'Title', 'Weight', 'Action'].forEach((text: string): void => {
    const cell = createEl({
      tagName: 'div',
      className: 'option-cell',
      textContent: text,
    });
    headerRow.appendChild(cell);
  });
  optionsTable.appendChild(headerRow);

  function renderOptions(): void {
    while (optionsTable.childNodes.length > 1) {
      const lastChild = optionsTable.lastChild;
      if (lastChild) {
        optionsTable.removeChild(lastChild);
      }
    }
    options.forEach((option: Option, index: number): void => {
      const row = createEl({ tagName: 'div', className: 'option-row' });
      row.appendChild(
        createEl({
          tagName: 'div',
          className: 'option-cell',
          textContent: option.id,
        }),
      );
      const titleInput: HTMLInputElement = document.createElement('input');
      titleInput.value = option.title;
      titleInput.oninput = (): void => {
        option.title = titleInput.value;
        saveOptions(options);
      };
      const titleCell = createEl({ tagName: 'div', className: 'option-cell' });
      titleCell.appendChild(titleInput);
      row.appendChild(titleCell);
      const weightInput: HTMLInputElement = document.createElement('input');
      weightInput.type = 'number';
      weightInput.value = option.weight === '' ? '' : option.weight.toString();
      weightInput.oninput = (): void => {
        option.weight =
          weightInput.value === '' ? '' : Number(weightInput.value);
        saveOptions(options);
      };
      const weightCell = createEl({ tagName: 'div', className: 'option-cell' });
      weightCell.appendChild(weightInput);
      row.appendChild(weightCell);
      const deleteButton = createEl({
        tagName: 'button',
        className: 'button',
        textContent: 'Delete',
      });
      deleteButton.onclick = (): void => {
        options.splice(index, 1);
        if (options.length === 0) {
          resetCounter();
          options = [{ id: '#1', title: '', weight: '' }];
        }
        saveOptions(options);
        renderOptions();
      };
      const actionCell = createEl({ tagName: 'div', className: 'option-cell' });
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      optionsTable.appendChild(row);
    });
  }
  renderOptions();

  const buttonsPanel = createEl({ tagName: 'div', className: 'buttons-panel' });
  document.body.appendChild(buttonsPanel);

  const addButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Add Option',
  });
  addButton.onclick = (): void => {
    let counter = loadCounter();
    counter++;
    const newOption: Option = { id: `#${counter}`, title: '', weight: '' };
    options.push(newOption);
    saveOptions(options);
    saveCounter(counter);
    renderOptions();
  };
  buttonsPanel.appendChild(addButton);

  const pasteButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Paste List',
  });
  pasteButton.onclick = (): void => {
    renderPasteListModal();
  };
  buttonsPanel.appendChild(pasteButton);

  const clearButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Clear List',
  });
  clearButton.onclick = (): void => {
    options = [];
    saveOptions(options);
    resetCounter();
    renderOptions();
  };
  buttonsPanel.appendChild(clearButton);

  const saveJsonButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Save List to JSON',
  });
  saveJsonButton.onclick = (): void => {
    const dataStr = JSON.stringify(options, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'options.json';
    a.click();
    URL.revokeObjectURL(url);
  };
  buttonsPanel.appendChild(saveJsonButton);

  const loadJsonButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Load List from JSON',
  });
  loadJsonButton.onclick = (): void => {
    renderLoadJsonModal();
  };
  buttonsPanel.appendChild(loadJsonButton);

  const startButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Start',
  });
  startButton.onclick = (): void => {
    const validOptions = options.filter(
      (opt: Option): boolean =>
        opt.title.trim() !== '' && Number(opt.weight) > 0,
    );
    if (validOptions.length >= 2) {
      router.navigate(
        '/vitali007tut-JSFE2024Q4/decision-making-tool/decision-picker',
      );
    } else {
      renderAddValidOptionsModal();
    }
  };
  buttonsPanel.appendChild(startButton);

  const renderPasteListModal = (): void => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeModal = (): void => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };
    document.body.style.overflow = 'hidden';

    const pasteField = document.createElement('textarea');
    pasteField.placeholder = 'Paste CSV-like data (title,weight per line)';
    pasteField.style.width = '100%';
    pasteField.style.height = '100px';
    modal.appendChild(pasteField);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Confirm';
    confirmButton.onclick = (): void => {
      const text = pasteField.value.trim();
      if (text) {
        const lines = text.split('\n');
        let counter = loadCounter();
        lines.forEach((line: string): void => {
          const parts = line.split(',');
          const title = parts[0]?.trim() || '';
          const weight = parts[1] ? Number(parts[1].trim()) : '';
          counter++;
          options.push({ id: `#${counter}`, title, weight });
        });
        saveOptions(options);
        saveCounter(counter);
        renderOptions();
      }
      closeModal();
    };
    modal.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeModal;
    modal.appendChild(cancelButton);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.onclick = (e: Event): void => {
      if (e.target === overlay) closeModal();
    };
    window.onkeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal();
    };
  };

  const renderLoadJsonModal = (): void => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeModal = (): void => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };
    document.body.style.overflow = 'hidden';

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    modal.appendChild(fileInput);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Load';
    confirmButton.onclick = (): void => {
      const file = fileInput.files ? fileInput.files[0] : null;
      if (file) {
        const reader = new FileReader();
        reader.onload = (): void => {
          try {
            if (typeof reader.result !== 'string') {
              throw new Error('Invalid file content');
            }
            const parsed: unknown = JSON.parse(reader.result);
            if (Array.isArray(parsed) && parsed.every(isOption)) {
              saveOptions(parsed);
              window.location.reload();
            } else {
              alert('Error parsing JSON');
            }
          } catch {
            alert('Error parsing JSON');
          }
        };
        reader.readAsText(file);
      }
      closeModal();
    };
    modal.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.onclick = closeModal;
    modal.appendChild(cancelButton);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.onclick = (e: Event): void => {
      if (e.target === overlay) closeModal();
    };
    window.onkeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal();
    };
  };

  const renderAddValidOptionsModal = (): void => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const modal = document.createElement('div');
    modal.className = 'modal';

    const closeModal = (): void => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };
    document.body.style.overflow = 'hidden';

    const message = document.createElement('div');
    message.textContent =
      'Please add at least two valid options (non-empty title and weight > 0).';
    modal.appendChild(message);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = closeModal;
    modal.appendChild(closeButton);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.onclick = (e: Event): void => {
      if (e.target === overlay) closeModal();
    };
    window.onkeydown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') closeModal();
    };
  };
}
