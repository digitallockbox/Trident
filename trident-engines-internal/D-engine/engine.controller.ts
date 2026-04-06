import { DEngineService } from "./engine.service";

export const DEngineController = {
    info: (req, res) => {
        res.json(DEngineService.getMetadata());
    }
};
