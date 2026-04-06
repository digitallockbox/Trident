import { FC } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GradientTitle from '../components/ui/GradientTitle';
import { usePantheon } from '../state/hooks/usePantheon';

const PantheonPage: FC = () => {
  const { data, loading, execute } = usePantheon();

  return (
    <div className="container mx-auto px-4 py-12">
      <GradientTitle text="Pantheon Engine" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">Hierarchical data organization.</p>
      <GlassCard title="Pantheon Status">
        <button onClick={() => execute({})} disabled={loading} className="px-4 py-2 bg-cyan-500 rounded text-white">
          {loading ? 'Organizing...' : 'Organize'}
        </button>
        {data && <pre className="mt-4 bg-slate-900 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>}
      </GlassCard>
    </div>
  );
};

export default PantheonPage;
