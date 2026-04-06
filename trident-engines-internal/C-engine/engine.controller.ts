import { CEngineService } from "./engine.service";

export const CEngineController = {
    info: (req, res) => {
        res.json(CEngineService.getMetadata());
    }
};
