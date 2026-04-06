import { createBrowserRouter } from "react-router-dom";

import "../assets/styles/not-found.css";

import Home from "../pages/Home/Home";
import Profile from "../pages/Profile";
import AdminDashboard from "../pages/AdminDashboard";
import Login from "../pages/Login";
import AscendAdminPage from "../pages/AscendAdminPage";
import Dashboard from "../pages/Dashboard/Dashboard";
import WarRoom from "../pages/WarRoom/WarRoom";

import AegisPage from "../pages/AegisPage";
import ApexPage from "../pages/ApexPage";
import AscendantPage from "../pages/AscendantPage";
import ChronosPage from "../pages/ChronosPage";
import ContinuumPage from "../pages/ContinuumPage";
import EchelonPage from "../pages/EchelonPage";
import EternumPage from "../pages/EternumPage";
import FusionPage from "../pages/FusionPage";
import GenesisPage from "../pages/GenesisPage";
import HeliosPage from "../pages/HeliosPage";
import HelixPage from "../pages/HelixPage";
import HyperionPage from "../pages/HyperionPage";
import InfinityPage from "../pages/InfinityPage";
import LumenPage from "../pages/LumenPage";
import MonarchPage from "../pages/MonarchPage";
import NexusPage from "../pages/NexusPage";
import Nexus2Page from "../pages/Nexus2Page";
import OmegaPage from "../pages/OmegaPage";
import OraclePage from "../pages/OraclePage";
import OvermindPage from "../pages/OvermindPage";
import OverwatchPage from "../pages/OverwatchPage";
import PantheonPage from "../pages/PantheonPage";
import ParagonPage from "../pages/Engines/ParagonPage";
import PrimePage from "../pages/PrimePage";
import SentinelPage from "../pages/SentinelPage";
import SolarisPage from "../pages/SolarisPage";
import SovereignPage from "../pages/SovereignPage";
import SorvereignPage from "../pages/Engines/SorvereignPage";
import RouterPage from "../pages/Engines/RouterPage";

const NotFound = () => (
  <div className="not-found-page">
    <h1 className="not-found-code">404</h1>
    <p className="not-found-text">Route not found</p>
    <a href="/" className="not-found-link">
      Return to base
    </a>
  </div>
);

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/profile", element: <Profile /> },
  { path: "/admin", element: <AdminDashboard /> },
  { path: "/admin/ascend", element: <AscendAdminPage /> },
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/warroom", element: <WarRoom /> },

  { path: "/aegis", element: <AegisPage /> },
  { path: "/apex", element: <ApexPage /> },
  { path: "/ascendant", element: <AscendantPage /> },
  { path: "/chronos", element: <ChronosPage /> },
  { path: "/continuum", element: <ContinuumPage /> },
  { path: "/echelon", element: <EchelonPage /> },
  { path: "/eternum", element: <EternumPage /> },
  { path: "/fusion", element: <FusionPage /> },
  { path: "/genesis", element: <GenesisPage /> },
  { path: "/helios", element: <HeliosPage /> },
  { path: "/helix", element: <HelixPage /> },
  { path: "/hyperion", element: <HyperionPage /> },
  { path: "/infinity", element: <InfinityPage /> },
  { path: "/lumen", element: <LumenPage /> },
  { path: "/monarch", element: <MonarchPage /> },
  { path: "/nexus", element: <NexusPage /> },
  { path: "/nexus2", element: <Nexus2Page /> },
  { path: "/omega", element: <OmegaPage /> },
  { path: "/oracle", element: <OraclePage /> },
  { path: "/overmind", element: <OvermindPage /> },
  { path: "/overwatch", element: <OverwatchPage /> },
  { path: "/pantheon", element: <PantheonPage /> },
  { path: "/paragon", element: <ParagonPage /> },
  { path: "/engines/paragon", element: <ParagonPage /> },
  { path: "/prime", element: <PrimePage /> },
  { path: "/sentinel", element: <SentinelPage /> },
  { path: "/solaris", element: <SolarisPage /> },
  { path: "/sovereign", element: <SovereignPage /> },
  { path: "/engines/sorvereign", element: <SorvereignPage /> },
  { path: "/engines/router", element: <RouterPage /> },

  { path: "*", element: <NotFound /> },
]);
