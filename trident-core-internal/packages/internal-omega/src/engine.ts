import { Engine } from '@trident/engine-shared/engine.interface';

export interface OmegaPayload {
    numbers: number[];
    operation: 'sum' | 'product';
}

export class OmegaEngine implements Engine {
    async execute(payload: OmegaPayload): Promise<any> {
        // Input validation
        if (!payload || !Array.isArray(payload.numbers) || !payload.operation) {
            return { status: 'error', error: 'Invalid payload' };
        }

        let result: number;
        if (payload.operation === 'sum') {
            result = payload.numbers.reduce((a, b) => a + b, 0);
        } else if (payload.operation === 'product') {
            result = payload.numbers.reduce((a, b) => a * b, 1);
        } else {
            return { status: 'error', error: 'Unknown operation' };
        }

        // Example: add owner-only business logic here
        // e.g., logging, access control, advanced computation, etc.

        return {
            status: 'success',
            operation: payload.operation,
            input: payload.numbers,
            result,
        };
    }
}

// For compatibility with existing imports
export const executeOmega = async (payload: OmegaPayload) => {
    return new OmegaEngine().execute(payload);
};
