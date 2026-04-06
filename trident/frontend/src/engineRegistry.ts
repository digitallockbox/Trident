
import { useParagonEngine } from '../hooks/engines/useParagonEngine';
import { useRouterEngine } from '../hooks/engines/useRouterEngine';
import { useSorvereignEngine } from '../hooks/engines/useSorvereignEngine';
import { useAegisEngine } from '../hooks/engines/useAegisEngine';
import useOmegaEngine from '../hooks/engines/useOmegaEngine';
import { useOverwatchEngine } from '../hooks/engines/useOverwatchEngine';

import ParagonPage from '../pages/Engines/ParagonPage';
import RouterPage from '../pages/Engines/RouterPage';
import SorvereignPage from '../pages/Engines/SorvereignPage';
import AegisPage from '../pages/Engines/AegisPage';

import OmegaPage from '../pages/Engines/OmegaPage';

import OverwatchPage from '../pages/Engines/OverwatchPage';

export const engineRegistry = {
    paragon: {
        hook: useParagonEngine,
        page: ParagonPage,
    },
    router: {
        hook: useRouterEngine,
        page: RouterPage,
    },
    sorvereign: {
        hook: useSorvereignEngine,
        page: SorvereignPage,
    },
    overwatch: {
        hook: useOverwatchEngine,
        page: OverwatchPage,
        name: "Overwatch Engine",
        description: "Run the Overwatch engine with a custom payload.",
    },
    aegis: {
        hook: useAegisEngine,
        page: AegisPage,
    },
    omega: {
        hook: useOmegaEngine,
        page: OmegaPage,
        name: "Omega Engine",
        description: "Run the Omega engine with a custom payload.",
    },
    // ...add more engines as you scaffold them
};
