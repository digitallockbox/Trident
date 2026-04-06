import { SINGULARITY } from './singularityCore';
import { sendApexIntent } from './apexIntent';

export class ElysiumChannel {
  influenceContinuum(intent: { type: string }) {
    sendApexIntent(intent);
  }

  influenceOperator() {
    const continuum = SINGULARITY.get();

    if (continuum.activeMode === 'focus') {
      return { suggestion: 'AMPLIFY' };
    }

    if (continuum.epoch === 'night') {
      return { suggestion: 'QUIET' };
    }

    if (continuum.activeMode === 'calm') {
      return { suggestion: 'FOCUS' };
    }

    return null;
  }
}

export const ELYSIUM = new ElysiumChannel();
