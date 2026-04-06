import { renderHook, act } from '@testing-library/react-hooks';
import { useParagonEngine } from '../useParagonEngine';

global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve({ ok: true, result: { status: 'success' } })
})) as jest.Mock;

describe('useParagonEngine', () => {
    it('calls the API and returns result', async () => {
        const { result } = renderHook(() => useParagonEngine());
        let data;
        await act(async () => {
            data = await result.current.execute({ action: 'schemas' });
        });
        expect(data.ok).toBe(true);
        expect(data.result.status).toBe('success');
    });
});
