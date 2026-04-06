import useAegisEngine from '../hooks/engines/useAegisEngine';
import useApexEngine from '../hooks/engines/useApexEngine';
import useAscendantEngine from '../hooks/engines/useAscendantEngine';
import useChronosEngine from '../hooks/engines/useChronosEngine';
import useConduitEngine from '../hooks/engines/useConduitEngine';
import useContinuumEngine from '../hooks/engines/useContinuumEngine';
import useDispatchEngine from '../hooks/engines/useDispatchEngine';
import useEchelonEngine from '../hooks/engines/useEchelonEngine';
import useEternumEngine from '../hooks/engines/useEternumEngine';
import useFusionEngine from '../hooks/engines/useFusionEngine';
import useGenesisEngine from '../hooks/engines/useGenesisEngine';
import useHeliosEngine from '../hooks/engines/useHeliosEngine';
import useHelixEngine from '../hooks/engines/useHelixEngine';
import useHyperionEngine from '../hooks/engines/useHyperionEngine';
import useInfinityEngine from '../hooks/engines/useInfinityEngine';
import useKeystoneEngine from '../hooks/engines/useKeystoneEngine';
import useLumenEngine from '../hooks/engines/useLumenEngine';
import useMonarchEngine from '../hooks/engines/useMonarchEngine';
import useNexusEngine from '../hooks/engines/useNexusEngine';
import useNexus2Engine from '../hooks/engines/useNexus2Engine';
import useOmegaEngine from '../hooks/engines/useOmegaEngine';
import useOracleEngine from '../hooks/engines/useOracleEngine';
import useOvermindEngine from '../hooks/engines/useOvermindEngine';
import useOverwatchEngine from '../hooks/engines/useOverwatchEngine';
import usePantheonEngine from '../hooks/engines/usePantheonEngine';
import useParagonEngine from '../hooks/engines/useParagonEngine';
import usePrimeEngine from '../hooks/engines/usePrimeEngine';
import useRelayEngine from '../hooks/engines/useRelayEngine';
import useRouterEngine from '../hooks/engines/useRouterEngine';
import useSentinelEngine from '../hooks/engines/useSentinelEngine';
import useSolarisEngine from '../hooks/engines/useSolarisEngine';
import useSovereignEngine from '../hooks/engines/useSovereignEngine';

import AegisPage from '../pages/Engines/AegisPage';
import ApexPage from '../pages/Engines/ApexPage';
import AscendantPage from '../pages/Engines/AscendantPage';
import ChronosPage from '../pages/Engines/ChronosPage';
import ConduitPage from '../pages/Engines/ConduitPage';
import ContinuumPage from '../pages/Engines/ContinuumPage';
import DispatchPage from '../pages/Engines/DispatchPage';
import EchelonPage from '../pages/Engines/EchelonPage';
import EternumPage from '../pages/Engines/EternumPage';
import FusionPage from '../pages/Engines/FusionPage';
import GenesisPage from '../pages/Engines/GenesisPage';
import HeliosPage from '../pages/Engines/HeliosPage';
import HelixPage from '../pages/Engines/HelixPage';
import HyperionPage from '../pages/Engines/HyperionPage';
import InfinityPage from '../pages/Engines/InfinityPage';
import KeystonePage from '../pages/Engines/KeystonePage';
import LumenPage from '../pages/Engines/LumenPage';
import MonarchPage from '../pages/Engines/MonarchPage';
import NexusPage from '../pages/Engines/NexusPage';
import Nexus2Page from '../pages/Engines/Nexus2Page';
import OmegaPage from '../pages/Engines/OmegaPage';
import OraclePage from '../pages/Engines/OraclePage';
import OvermindPage from '../pages/Engines/OvermindPage';
import OverwatchPage from '../pages/Engines/OverwatchPage';
import PantheonPage from '../pages/Engines/PantheonPage';
import ParagonPage from '../pages/Engines/ParagonPage';
import PrimePage from '../pages/Engines/PrimePage';
import RelayPage from '../pages/Engines/RelayPage';
import RouterPage from '../pages/Engines/RouterPage';
import SentinelPage from '../pages/Engines/SentinelPage';
import SolarisPage from '../pages/Engines/SolarisPage';
import SovereignPage from '../pages/Engines/SovereignPage';

export const engineRegistry = {
    aegis: { hook: useAegisEngine, page: AegisPage },
    apex: { hook: useApexEngine, page: ApexPage },
    ascendant: { hook: useAscendantEngine, page: AscendantPage },
    chronos: { hook: useChronosEngine, page: ChronosPage },
    conduit: { hook: useConduitEngine, page: ConduitPage },
    continuum: { hook: useContinuumEngine, page: ContinuumPage },
    dispatch: { hook: useDispatchEngine, page: DispatchPage },
    echelon: { hook: useEchelonEngine, page: EchelonPage },
    eternum: { hook: useEternumEngine, page: EternumPage },
    fusion: { hook: useFusionEngine, page: FusionPage },
    genesis: { hook: useGenesisEngine, page: GenesisPage },
    helios: { hook: useHeliosEngine, page: HeliosPage },
    helix: { hook: useHelixEngine, page: HelixPage },
    hyperion: { hook: useHyperionEngine, page: HyperionPage },
    infinity: { hook: useInfinityEngine, page: InfinityPage },
    keystone: { hook: useKeystoneEngine, page: KeystonePage },
    lumen: { hook: useLumenEngine, page: LumenPage },
    monarch: { hook: useMonarchEngine, page: MonarchPage },
    nexus: { hook: useNexusEngine, page: NexusPage },
    nexus2: { hook: useNexus2Engine, page: Nexus2Page },
    omega: { hook: useOmegaEngine, page: OmegaPage },
    oracle: { hook: useOracleEngine, page: OraclePage },
    overmind: { hook: useOvermindEngine, page: OvermindPage },
    overwatch: { hook: useOverwatchEngine, page: OverwatchPage },
    pantheon: { hook: usePantheonEngine, page: PantheonPage },
    paragon: { hook: useParagonEngine, page: ParagonPage },
    prime: { hook: usePrimeEngine, page: PrimePage },
    relay: { hook: useRelayEngine, page: RelayPage },
    router: { hook: useRouterEngine, page: RouterPage },
    sentinel: { hook: useSentinelEngine, page: SentinelPage },
    solaris: { hook: useSolarisEngine, page: SolarisPage },
    sovereign: { hook: useSovereignEngine, page: SovereignPage },
};
