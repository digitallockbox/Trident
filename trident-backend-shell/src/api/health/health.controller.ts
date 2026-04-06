export const healthController = {
    status: () => ({ status: "ok" })
};
export const healthController = {
    status: (req, res) => {
        res.json({ status: "ok", timestamp: Date.now() });
    }
};
