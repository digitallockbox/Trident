import { FC } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GradientTitle from '../components/ui/GradientTitle';
import { useSolaris } from '../state/hooks/useSolaris';

const SolarisPage: FC = () => {
  const { data, loading, execute } = useSolaris();

  return (
    <div className="container mx-auto px-4 py-12">
      <GradientTitle text="Solaris Engine" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">Energy and power management.</p>
      <GlassCard title="Solaris Status">
        <button onClick={() => execute({})} disabled={loading} className="px-4 py-2 bg-cyan-500 rounded text-white">
          {loading ? 'Powering...' : 'Energize'}
        </button>
        {data && <pre className="mt-4 bg-slate-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>}
      </GlassCard>
    </div>
  );
};

export default SolarisPage;
