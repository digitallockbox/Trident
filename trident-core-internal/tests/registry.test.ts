describe("Engine Registry", () => {
    it("contains an engines array", () => {
        const registry = { engines: [] };
        expect(Array.isArray(registry.engines)).toBe(true);
    });
});
