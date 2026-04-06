import { auroraSentience } from './auroraSentience';
import { halcyonIntelligence } from './halcyonIntelligence';
import { eclipseIntelligence } from './eclipseIntelligence';
import { ELYSIUM } from './elysiumChannel';
import { startElysiumLoop } from './elysiumLoop';
import { SINGULARITY } from './singularityCore';

export const startConsciousLoop = () => {
  auroraSentience();
  halcyonIntelligence();
  eclipseIntelligence();
  startElysiumLoop();

  setInterval(() => {
    SINGULARITY.tick();
    auroraSentience();
    halcyonIntelligence();
    eclipseIntelligence();

    const suggestion = ELYSIUM.influenceOperator();
    if (suggestion) {
      ELYSIUM.influenceContinuum({ type: suggestion.suggestion });
    }
  }, 3000);
};
