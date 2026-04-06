import axios, { AxiosError, AxiosRequestConfig } from "axios";

export interface PayoutRequest {
    amountLamports: number;
}

export interface PayoutResponse {
    txId: string;
    status: string;
    [key: string]: any;
}

/**
 * Makes a payout request to the Omega endpoint.
 * @param payload - The payout request payload (amountLamports)
 * @param authHeaders - Hybrid auth headers (API key, Solana signature, etc.)
 * @param config - Optional Axios config
 * @returns PayoutResponse
 * @throws Error with a clear message if the request fails
 */
export async function requestPayout(
    payload: PayoutRequest,
    authHeaders: Record<string, string>,
    config?: AxiosRequestConfig
): Promise<PayoutResponse> {
    try {
        const res = await axios.post<PayoutResponse>(
            "/omega/payout",
            payload,
            {
                headers: {
                    ...authHeaders,
                    "Content-Type": "application/json",
                },
                ...config,
            }
        );
        return res.data;
    } catch (err) {
        let message = "Payout request failed.";
        if (axios.isAxiosError(err)) {
            message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                message;
        } else if (err instanceof Error) {
            message = err.message;
        }
        throw new Error(message);
    }
}
