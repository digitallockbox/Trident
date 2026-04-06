import { authService } from "./auth.service";

export const authController = {
    login: (req, res) => {
        const { email } = req.body;
        res.json(authService.login(email));
    },

    logout: (req, res) => {
        res.json(authService.logout());
    },

    session: (req, res) => {
        res.json(authService.session());
    }
};
