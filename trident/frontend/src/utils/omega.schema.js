"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmegaStateSchema = exports.OmegaPayoutRequestSchema = void 0;
const zod_1 = require("zod");
exports.OmegaPayoutRequestSchema = zod_1.z.object({
    toWallet: zod_1.z.string().min(32).max(64),
    amountLamports: zod_1.z.number().int().positive(),
    tokenMint: zod_1.z.string().min(32).max(64).optional(),
    referenceId: zod_1.z.string().uuid().optional(),
});
exports.OmegaStateSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(true),
});
//# sourceMappingURL=omega.schema.js.map