export const errorHandler = () => {
    console.log("Error handler placeholder");
    export const errorHandler = (err, req, res, next) => {
        console.error("Error:", err);
        res.status(500).json({ error: "Internal server error" });
    };
};
