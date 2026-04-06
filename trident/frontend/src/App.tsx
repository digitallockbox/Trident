import { FC, useEffect, useState } from "react";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Layout from "./components/layout/Layout";
import AdminDashboard from "./pages/AdminDashboard";
import { AuroraBar } from "./components/layout/AuroraBar";
import { HalcyonBar } from "./components/layout/HalcyonBar";
import { EclipseBar } from "./components/layout/EclipseBar";
import { ElysiumBar } from "./components/layout/ElysiumBar";
import { startConsciousLoop } from "./utils/auroraHalcyonEclipseLoop";
import "./assets/styles/aurora.css";
import "./assets/styles/halcyon.css";
import "./assets/styles/eclipse.css";
import "./assets/styles/elysium.css";
import { WalletContextProvider } from "../logic/wallet";

type View = "home" | "admin";

const App: FC = () => {
  const [view, setView] = useState<View>("admin");

  useEffect(() => {
    startConsciousLoop();
  }, []);

  return (
    <WalletContextProvider>
      <Layout>
        <div className="relative min-h-screen overflow-hidden">
          <div className="aurora-layer" />
          <div className="halcyon-layer" />
          <div className="eclipse-layer" />
          <div className="elysium-layer" />

          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative z-10">
            <div className="container mx-auto px-4 py-6 flex flex-wrap gap-3 items-center">
              return (
                <ErrorBoundary>
                  <WalletContextProvider>
                    <Layout>
                      <div className="relative min-h-screen overflow-hidden">
                        <div className="aurora-layer" />
                        <div className="halcyon-layer" />
                        <div className="eclipse-layer" />
                        <div className="elysium-layer" />

                        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative z-10">
                          <div className="container mx-auto px-4 py-6 flex flex-wrap gap-3 items-center">
                            <button
                              onClick={() => setView("home")}
                              className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white"
                            >
                              Home
                            </button>
                          </div>
                          {/* ...existing code... */}
                        </div>
              <EclipseBar />
                    </Layout>
                  </WalletContextProvider>
                </ErrorBoundary>
              );
              {view === "home" ? (
                <div>
                  <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                    Trident Platform
                  </h1>
                  <p className="text-xl text-slate-300">
                    Welcome to the unified data analysis and monitoring system.
                  </p>
                </div>
              ) : (
                <AdminDashboard />
              )}
            </div>
          </div>
        </div>
      </Layout>
    </WalletContextProvider>
  );
};

export default App;
