import type { Option } from './models';

const STORAGE_KEY = 'options_list';
const COUNTER_KEY = 'option_counter';

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

export function loadOptions(): Option[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every(isOption)) {
        return parsed;
      }
      return [];
    } catch {
      return [];
    }
  }
  return [{ id: '#1', title: '', weight: '' }];
}

export function saveOptions(options: Option[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
}

export function loadCounter(): number {
  const stored = localStorage.getItem(COUNTER_KEY);
  return stored ? parseInt(stored, 10) : 1;
}

export function saveCounter(counter: number): void {
  localStorage.setItem(COUNTER_KEY, counter.toString());
}

export function resetCounter(): void {
  localStorage.removeItem(COUNTER_KEY);
}
