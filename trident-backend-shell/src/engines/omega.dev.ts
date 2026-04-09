// omega.dev.ts
// Contractor-safe Omega engine logic for development/testing

export async function executeOmegaDev(payload: any) {
    // Simulate a safe, non-sensitive computation
    if (!payload || !Array.isArray(payload.numbers) || !payload.operation) {
        return { status: 'error', error: 'Invalid payload (dev)' };
    }

    let result: number;
    if (payload.operation === 'sum') {
        result = payload.numbers.reduce((a, b) => a + b, 0);
    } else if (payload.operation === 'product') {
        result = payload.numbers.reduce((a, b) => a * b, 1);
    } else {
        return { status: 'error', error: 'Unknown operation (dev)' };
    }

    return {
        status: 'success',
        operation: payload.operation,
        input: payload.numbers,
        result,
        dev: true,
    };
}
