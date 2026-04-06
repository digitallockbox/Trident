import { BEngineService } from "./engine.service";

export const BEngineController = {
    info: (req, res) => {
        res.json(BEngineService.getMetadata());
    }
};
