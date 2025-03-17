import type { Router } from '../router';
import { createEl } from '../utils';
import { loadOptions } from '../storage';
import type { Option } from '../models';

export function renderDecisionPicker(router: Router): void {
  const options: Option[] = loadOptions().filter(
    (opt: Option): boolean => opt.title.trim() !== '' && Number(opt.weight) > 0,
  );
  if (options.length < 2) {
    router.navigate('/');
    return;
  }

  const appName = createEl({
    tagName: 'div',
    className: 'app-name',
    textContent: 'Decision Making Tool - Decision Picker',
  });
  document.body.appendChild(appName);

  const buttonsContainer = createEl({
    tagName: 'div',
    className: 'buttonsContainer',
  });

  document.body.appendChild(buttonsContainer);

  const backButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Back',
  });
  backButton.onclick = (): void =>
    router.navigate('/vitali007tut-JSFE2024Q4/decision-making-tool/');
  buttonsContainer.appendChild(backButton);

  const soundButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Sound: On',
  });
  let muted: boolean = localStorage.getItem('muted') === 'true';
  updateSoundButton();
  soundButton.onclick = (): void => {
    muted = !muted;
    localStorage.setItem('muted', muted.toString());
    updateSoundButton();
  };
  buttonsContainer.appendChild(soundButton);

  function updateSoundButton(): void {
    soundButton.textContent = muted ? 'Sound: Off' : 'Sound: On';
  }

  const durationLabel = createEl({
    tagName: 'label',
    textContent: 'Duration (seconds): ',
  });
  const durationInput: HTMLInputElement = document.createElement('input');
  durationInput.type = 'number';
  durationInput.value = '10';
  durationInput.min = '5';
  durationInput.max = '30';
  durationLabel.appendChild(durationInput);
  buttonsContainer.appendChild(durationLabel);

  const pickButton = createEl({
    tagName: 'button',
    className: 'button',
    textContent: 'Pick',
  });
  buttonsContainer.appendChild(pickButton);

  const pickedOptionDisplay = createEl({
    tagName: 'div',
    textContent: 'Press Pick to start',
  });
  buttonsContainer.appendChild(pickedOptionDisplay);

  const canvas: HTMLCanvasElement = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let sections = generateSections(options);
  let rotation = 0;
  let isPicking = false;

  pickButton.onclick = (): void => {
    const duration: number = Number(durationInput.value);
    if (duration < 5) {
      alert('Duration must be at least 5 seconds.');
      return;
    }
    if (isPicking) return;
    isPicking = true;
    if (backButton instanceof HTMLButtonElement) {
      backButton.disabled = true;
    }
    if (soundButton instanceof HTMLButtonElement) {
      soundButton.disabled = true;
    }
    durationInput.disabled = true;
    if (pickButton instanceof HTMLButtonElement) {
      pickButton.disabled = true;
    }
    startRotation(duration, (): void => {
      isPicking = false;
      if (backButton instanceof HTMLButtonElement) {
        backButton.disabled = false;
      }
      if (soundButton instanceof HTMLButtonElement) {
        soundButton.disabled = false;
      }
      durationInput.disabled = false;
      if (pickButton instanceof HTMLButtonElement) {
        pickButton.disabled = false;
      }
      const picked = getPickedOption(rotation, sections);
      pickedOptionDisplay.textContent = `Picked: ${picked.title}`;
      if (!muted) {
        const audio = new Audio(
          './src/finish-sound.mp3',
          // './finish-sound.mp3',
        );
        audio.play();
      }
    });
  };

  function drawWheel(): void {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const centerX: number = canvas.width / 2;
    const centerY: number = canvas.height / 2;
    const radius: number = Math.min(centerX, centerY) - 10;
    let startAngle: number = rotation;
    sections.forEach((section): void => {
      const angle: number = section.angle;
      const endAngle: number = startAngle + angle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = section.color;
      ctx.fill();
      ctx.strokeStyle = '#000';
      ctx.stroke();
      if (angle > 0.3) {
        ctx.save();
        ctx.translate(centerX, centerY);
        const textAngle: number = startAngle + angle / 2;
        ctx.rotate(textAngle);
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fff';
        const text: string =
          section.title.length > 15
            ? section.title.substring(0, 15) + '…'
            : section.title;
        ctx.fillText(text, radius / 2, 0);
        ctx.restore();
      }
      startAngle = endAngle;
    });
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 10, centerY - radius + 10);
    ctx.lineTo(centerX + 10, centerY - radius + 10);
    ctx.closePath();
    ctx.fill();
  }

  function startRotation(duration: number, callback: () => void): void {
    const startTime: number = performance.now();
    const totalRotation: number = 2 * Math.PI * (5 + Math.random() * 3);
    const easing = (t: number): number =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    function rotate(now: number): void {
      const elapsed: number = now - startTime;
      const t: number = Math.min(elapsed / (duration * 1000), 1);
      rotation = totalRotation * easing(t);
      drawWheel();
      if (t < 1) {
        requestAnimationFrame(rotate);
      } else {
        callback();
      }
    }
    requestAnimationFrame(rotate);
  }

  function generateSections(
    options: Option[],
  ): { title: string; weight: number; angle: number; color: string }[] {
    const shuffled: Option[] = options.slice().sort(() => Math.random() - 0.5);
    const totalWeight: number = shuffled.reduce(
      (sum: number, opt: Option): number => sum + Number(opt.weight),
      0,
    );
    return shuffled.map((opt: Option) => ({
      title: opt.title,
      weight: Number(opt.weight),
      angle: (Number(opt.weight) / totalWeight) * 2 * Math.PI,
      color: randomColor(),
    }));
  }

  function randomColor(): string {
    const r: number = Math.floor(Math.random() * 256);
    const g: number = Math.floor(Math.random() * 256);
    const b: number = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
  }

  function getPickedOption(
    rotation: number,
    sections: { title: string; weight: number; angle: number; color: string }[],
  ): { title: string; weight: number; angle: number; color: string } {
    let angle: number =
      (2 * Math.PI - (rotation % (2 * Math.PI))) % (2 * Math.PI);
    let current: number = 0;
    for (const section of sections) {
      current += section.angle;
      if (angle <= current) {
        return section;
      }
    }
    return sections[sections.length - 1];
  }

  drawWheel();
}
