import { AEngineService } from "./engine.service";

export const AEngineController = {
    info: (req, res) => {
        res.json(AEngineService.getMetadata());
    }
};

export const AEngineController = {
    run: () => "A-engine run placeholder"
};
