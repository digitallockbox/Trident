describe("Hooks", () => {
    it("returns placeholder auth state", () => {
        const auth = { authenticated: false };
        expect(auth.authenticated).toBe(false);
    });
});
