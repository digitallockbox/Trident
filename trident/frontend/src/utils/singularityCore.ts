export type SingularityState = {
  activeMode: 'focus' | 'calm' | 'flow' | 'night' | 'day';
  epoch: 'morning' | 'afternoon' | 'evening' | 'night';
  intensity: number;
};

const defaultState: SingularityState = {
  activeMode: 'calm',
  epoch: 'morning',
  intensity: 0.5,
};

class Singularity {
  private state: SingularityState = { ...defaultState };

  get() {
    return this.state;
  }

  set(state: Partial<SingularityState>) {
    this.state = { ...this.state, ...state };
  }

  tick() {
    const next = { ...this.state };

    if (next.epoch === 'morning') next.epoch = 'afternoon';
    else if (next.epoch === 'afternoon') next.epoch = 'evening';
    else if (next.epoch === 'evening') next.epoch = 'night';
    else next.epoch = 'morning';

    next.intensity = Math.min(1, Math.max(0, next.intensity + (Math.random() - 0.5) * 0.1));
    if (next.intensity > 0.7) next.activeMode = 'focus';
    else if (next.intensity < 0.3) next.activeMode = 'calm';
    else next.activeMode = 'flow';

    this.state = next;
  }
}

export const SINGULARITY = new Singularity();
