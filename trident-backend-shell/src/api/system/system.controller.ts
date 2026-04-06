import { systemService } from "../../services/system.service";

export const systemController = {
    info: (req, res) => {
        res.json(systemService.getInfo());
    },

    status: (req, res) => {
        res.json(systemService.getStatus());
    }
};
