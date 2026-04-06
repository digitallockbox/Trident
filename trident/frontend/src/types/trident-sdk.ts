// Trident SDK Types — Foundation for Frontend & Backend Integration
// Place in: frontend/src/types/trident-sdk.ts

export type PublicKey = string; // Solana public key (base58)
export type Lamports = number; // Amount in lamports (smallest unit)
export type MintAddress = string; // SPL Token mint address

// Core Split Instruction
export interface SplitInstruction {
    amount: Lamports;
    creator: PublicKey;
    platform: PublicKey;
    affiliate?: PublicKey;
    mint: MintAddress;
    referenceId?: string; // Optional: for tracking (product, job, etc)
}

// Product Sale Instruction
export interface ProductSaleInstruction {
    productId: string;
    buyer: PublicKey;
    seller: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
}

// Job Payment Instruction
export interface JobPaymentInstruction {
    jobId: string;
    worker: PublicKey;
    employer: PublicKey;
    amount: Lamports;
    mint: MintAddress;
    affiliate?: PublicKey;
}

// Global Config
export interface GlobalConfig {
    feeBps: number; // Fee in basis points
    platform: PublicKey;
    treasury: PublicKey;
    version: string;
}

// Product Metadata
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

// Job Metadata
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

// Affiliate Stats
export interface AffiliateStats {
    affiliate: PublicKey;
    totalEarnings: Lamports;
    conversions: number;
    referredUsers: number;
}

// Creator Earnings
export interface CreatorEarnings {
    creator: PublicKey;
    totalEarnings: Lamports;
    splits: number;
    lastPayout: string; // ISO date
}

// API Response Types
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// Utility Types
export type Username = string;
export type ProductId = string;
export type JobId = string;

// Event Types (for indexer/backend)
export interface SplitExecutedEvent {
    amount: Lamports;
    creator: PublicKey;
    platform: PublicKey;
    affiliate?: PublicKey;
    mint: MintAddress;
    timestamp: string; // ISO date
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
