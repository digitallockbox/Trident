import { PRIME } from "../../utils/primeKernel";

export const AscendOverlay = () => {
  const state = {
    mode: PRIME.activeMode,
    epoch: localStorage.getItem("eternum_prime_epoch_segment") || "unknown",
    dominion: localStorage.getItem("eternum_monarch_state") || "unknown",
    hyperion: localStorage.getItem("eternum_hyperion_state") || "unknown",
    omega: localStorage.getItem("eternum_omega_state") || "unknown",
  };

  return (
    <div className="ascend-overlay">
      <div className="ascend-overlay-content">
        <div>Ascend Mode Active</div>
        <div className="ascend-overlay-details">
          <div>Mode: {state.mode}</div>
          <div>Epoch: {state.epoch}</div>
          <div>Dominion: {state.dominion}</div>
          <div>Hyperion: {state.hyperion}</div>
          <div>Omega: {state.omega}</div>
        </div>
      </div>
    </div>
  );
};
