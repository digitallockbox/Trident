import { SINGULARITY } from './singularityCore';

export const eclipseIntelligence = () => {
  const c = SINGULARITY.get();

  if (c.activeMode === 'focus') {
    document.documentElement.style.setProperty('--eclipse-opacity-high', '0.34');
    document.documentElement.style.setProperty('--eclipse-speed', '16s');
  } else if (c.activeMode === 'calm') {
    document.documentElement.style.setProperty('--eclipse-opacity-high', '0.18');
    document.documentElement.style.setProperty('--eclipse-speed', '24s');
  } else {
    document.documentElement.style.setProperty('--eclipse-opacity-high', '0.22');
    document.documentElement.style.setProperty('--eclipse-speed', '20s');
  }

  if (c.epoch === 'night') {
    document.documentElement.style.setProperty('--eclipse-color-1', 'rgba(8, 14, 40, 0.56)');
    document.documentElement.style.setProperty('--eclipse-color-2', 'rgba(5, 8, 30, 0.42)');
  }
};
