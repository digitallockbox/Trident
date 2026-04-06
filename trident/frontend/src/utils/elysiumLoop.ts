import { ELYSIUM } from './elysiumChannel';

export const startElysiumLoop = () => {
  setInterval(() => {
    const suggestion = ELYSIUM.influenceOperator();
    if (suggestion) {
      ELYSIUM.influenceContinuum({ type: suggestion.suggestion });
    }
  }, 5000);
};
