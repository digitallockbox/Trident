export const formatAmount = (amount: string | number): string => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return num.toFixed(8);
};

export const truncateWallet = (wallet: string, chars = 4): string => {
    if (wallet.length <= chars * 2 + 3) return wallet;
    return `${wallet.slice(0, chars)}...${wallet.slice(-chars)}`;
};

export const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));
