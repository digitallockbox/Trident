"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApexStateSchema = exports.ApexSplitRuleSchema = void 0;
const zod_1 = require("zod");
exports.ApexSplitRuleSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1).max(64),
    percentage: zod_1.z.number().min(0).max(100),
    recipient: zod_1.z.string().min(32).max(64), // wallet or account ID
});
exports.ApexStateSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
    rules: zod_1.z.array(exports.ApexSplitRuleSchema).default([]),
});
//# sourceMappingURL=apex.schema.js.map