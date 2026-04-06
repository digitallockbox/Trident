import { SINGULARITY } from './singularityCore';

export const halcyonIntelligence = () => {
  const c = SINGULARITY.get();

  if (c.activeMode === 'focus') {
    document.documentElement.style.setProperty('--halcyon-opacity-high', '0.20');
    document.documentElement.style.setProperty('--halcyon-speed', '14s');
  } else if (c.activeMode === 'calm') {
    document.documentElement.style.setProperty('--halcyon-opacity-high', '0.28');
    document.documentElement.style.setProperty('--halcyon-speed', '22s');
  } else {
    document.documentElement.style.setProperty('--halcyon-opacity-high', '0.23');
    document.documentElement.style.setProperty('--halcyon-speed', '18s');
  }

  if (c.epoch === 'night') {
    document.documentElement.style.setProperty('--halcyon-speed', '25s');
  }
};
