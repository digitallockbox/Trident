import { SINGULARITY } from './singularityCore';

export const auroraSentience = () => {
  const c = SINGULARITY.get();

  if (c.activeMode === 'focus') {
    document.documentElement.style.setProperty('--aurora-color-1', 'rgba(102, 204, 255, 0.6)');
    document.documentElement.style.setProperty('--aurora-color-2', 'rgba(0, 80, 255, 0.27)');
  } else if (c.activeMode === 'calm') {
    document.documentElement.style.setProperty('--aurora-color-1', 'rgba(170, 255, 204, 0.5)');
    document.documentElement.style.setProperty('--aurora-color-2', 'rgba(68, 221, 136, 0.18)');
  } else {
    document.documentElement.style.setProperty('--aurora-color-1', 'rgba(91, 177, 255, 0.36)');
    document.documentElement.style.setProperty('--aurora-color-2', 'rgba(37, 102, 220, 0.20)');
  }

  if (c.epoch === 'night') {
    document.documentElement.style.setProperty('--aurora-opacity-high', '0.24');
  } else {
    document.documentElement.style.setProperty('--aurora-opacity-high', '0.34');
  }
};
