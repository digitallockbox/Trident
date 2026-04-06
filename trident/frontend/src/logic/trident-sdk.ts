// Trident SDK Core Functions — TypeScript
// Place in: frontend/src/logic/trident-sdk.ts

import {
    SplitInstruction,
    ProductSaleInstruction,
    JobPaymentInstruction,
    GlobalConfig,
    ProductMetadata,
    JobMetadata,
    AffiliateStats,
    CreatorEarnings,
    ApiResponse,
    SplitExecutedEvent,
    ProductSaleEvent,
    JobPaymentEvent,
    AffiliateConversionEvent,
    ConfigUpdatedEvent,
    PublicKey,
    MintAddress,
    Lamports,
} from '../types/trident-sdk';

// --- SDK Core ---

// Build a split instruction

// Example: encode as [instructionType, ...fields]
export function buildSplitInstruction(input: SplitInstruction): Uint8Array {
    // Simple serialization: [1, ...amount, ...pubkeys]
    const type = 1; // split
    const amount = new Uint8Array(new BigUint64Array([BigInt(input.amount)]).buffer);
    const pubkeys = input.recipients.flatMap(pk => Array.from(pk));
    return new Uint8Array([type, ...amount, ...pubkeys]);
}

// Build a product sale instruction

export function buildProductSaleInstruction(input: ProductSaleInstruction): Uint8Array {
    const type = 2; // product sale
    const price = new Uint8Array(new BigUint64Array([BigInt(input.price)]).buffer);
    const productId = Array.from(new TextEncoder().encode(input.productId));
    return new Uint8Array([type, ...price, ...productId]);
}

// Build a job payment instruction

export function buildJobPaymentInstruction(input: JobPaymentInstruction): Uint8Array {
    const type = 3; // job payment
    const amount = new Uint8Array(new BigUint64Array([BigInt(input.amount)]).buffer);
    const jobId = Array.from(new TextEncoder().encode(input.jobId));
    return new Uint8Array([type, ...amount, ...jobId]);
}

// Validate Associated Token Account (ATA)

// Placeholder: always returns true. Replace with Solana web3.js logic for real validation.
export async function validateATA(owner: PublicKey, mint: MintAddress): Promise<boolean> {
    if (!owner || !mint) return false;
    // TODO: Use Solana web3.js to check if ATA exists
    return true;
}

// Fetch Global Config

export async function fetchGlobalConfig(): Promise<ApiResponse<GlobalConfig>> {
    try {
        // TODO: Fetch from on-chain or API
        return {
            success: true, data: {
                feeBps: 250,
                platform: '',
                treasury: '',
                version: '1.0.0',
            }
        };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Fetch Product Metadata

export async function fetchProductMetadata(productId: string): Promise<ApiResponse<ProductMetadata>> {
    try {
        // TODO: Fetch from API or on-chain
        return { success: false, error: 'Not implemented' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Fetch Job Metadata

export async function fetchJobMetadata(jobId: string): Promise<ApiResponse<JobMetadata>> {
    try {
        // TODO: Fetch from API or on-chain
        return { success: false, error: 'Not implemented' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Fetch Affiliate Stats

export async function fetchAffiliateStats(affiliate: PublicKey): Promise<ApiResponse<AffiliateStats>> {
    try {
        // TODO: Fetch from API or on-chain
        return { success: false, error: 'Not implemented' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Fetch Creator Earnings
export async function fetchCreatorEarnings(creator: PublicKey): Promise<ApiResponse<CreatorEarnings>> {
    // TODO: Fetch from API or on-chain
    return { success: false, error: 'Not implemented' };
}

// --- Connect to Live Backend API ---

// Helper for API calls
export async function apiGet<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url);
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
        return await res.json();
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

// Fetch Creator Earnings from backend
export async function fetchCreatorEarnings(creator: PublicKey): Promise<ApiResponse<CreatorEarnings>> {
    return apiGet<CreatorEarnings>(`/api/creator/${creator}/earnings`);
}

// Fetch Product Metadata list from backend
export async function fetchProductList(): Promise<ApiResponse<ProductMetadata[]>> {
    return apiGet<ProductMetadata[]>(`/api/store/products`);
}

// Fetch Job Metadata from backend
export async function fetchJobMetadata(jobId: string): Promise<ApiResponse<JobMetadata>> {
    return apiGet<JobMetadata>(`/api/jobs/${jobId}`);
}

// Fetch Affiliate Stats from backend
export async function fetchAffiliateStats(affiliate: PublicKey): Promise<ApiResponse<AffiliateStats>> {
    return apiGet<AffiliateStats>(`/api/affiliate/${affiliate}/stats`);
}

// Add apiPut helper to SDK
export async function apiPut<T>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
        return await res.json();
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

// Add apiDelete helper to SDK
export async function apiDelete<T>(url: string): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
        return await res.json();
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

// --- POST helpers for sending gifts, purchases, job payments ---

async function apiPost<T>(url: string, body: any): Promise<ApiResponse<T>> {
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        if (!res.ok) return { success: false, error: `HTTP ${res.status}` };
        return await res.json();
    } catch (e) {
        return { success: false, error: (e as Error).message };
    }
}

export async function sendGiftTx(data: SplitInstruction): Promise<ApiResponse<any>> {
    return apiPost('/api/send-gift', data);
}

export async function purchaseProductTx(data: ProductSaleInstruction): Promise<ApiResponse<any>> {
    return apiPost('/api/purchase-product', data);
}

export async function payJobTx(data: JobPaymentInstruction): Promise<ApiResponse<any>> {
    return apiPost('/api/pay-job', data);
}

// --- Event Types (for indexer/backend) ---
// These would be handled in backend/indexer code, not frontend SDK.

// --- Utility Functions ---
// Add more as needed for your integration.
