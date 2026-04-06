"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AscendStateSchema = void 0;
const zod_1 = require("zod");
exports.AscendStateSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().default(false),
});
//# sourceMappingURL=ascend.schema.js.map