export type PublicKey = string;
export type Lamports = number;
export type MintAddress = string;
export interface SplitInstruction {
    amount: Lamports;
    creator: PublicKey;
    platform: PublicKey;
    affiliate?: PublicKey;
    mint: MintAddress;
    referenceId?: string;
}
export interface ProductSaleInstruction {
    productId: string;
    buyer: PublicKey;
    seller: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
}
export interface JobPaymentInstruction {
    jobId: string;
    worker: PublicKey;
    employer: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
}
export interface GlobalConfig {
    feeBps: number;
    platform: PublicKey;
    treasury: PublicKey;
    version: string;
}
export interface ProductMetadata {
    id: string;
    name: string;
    description: string;
    price: Lamports;
    mint: MintAddress;
    seller: PublicKey;
    imageUrl?: string;
    tags?: string[];
}
export interface JobMetadata {
    id: string;
    title: string;
    description: string;
    employer: PublicKey;
    worker?: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
}
export interface AffiliateStats {
    affiliate: PublicKey;
    totalEarnings: Lamports;
    conversions: number;
    referredUsers: number;
}
export interface CreatorEarnings {
    creator: PublicKey;
    totalEarnings: Lamports;
    splits: number;
    lastPayout: string;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
export type Username = string;
export type ProductId = string;
export type JobId = string;
export interface SplitExecutedEvent {
    amount: Lamports;
    creator: PublicKey;
    platform: PublicKey;
    affiliate?: PublicKey;
    mint: MintAddress;
    timestamp: string;
    referenceId?: string;
}
export interface ProductSaleEvent {
    productId: string;
    buyer: PublicKey;
    seller: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
    timestamp: string;
}
export interface JobPaymentEvent {
    jobId: string;
    worker: PublicKey;
    employer: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
    timestamp: string;
}
export interface AffiliateConversionEvent {
    affiliate: PublicKey;
    user: PublicKey;
    timestamp: string;
}
export interface ConfigUpdatedEvent {
    config: GlobalConfig;
    timestamp: string;
}
//# sourceMappingURL=trident-sdk.d.ts.map