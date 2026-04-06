import { FC } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GradientTitle from '../components/ui/GradientTitle';
import { usePrime } from '../state/hooks/usePrime';

const PrimePage: FC = () => {
  const { data, loading, execute } = usePrime();

  return (
    <div className="container mx-auto px-4 py-12">
      <GradientTitle text="Prime Engine" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">Prime numbers and critical core operations.</p>
      <GlassCard title="Prime Status">
        <button onClick={() => execute({})} disabled={loading} className="px-4 py-2 bg-cyan-500 rounded text-white">
          {loading ? 'Computing...' : 'Compute'}
        </button>
        {data && <pre className="mt-4 bg-slate-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>}
      </GlassCard>
    </div>
  );
};

export default PrimePage;
