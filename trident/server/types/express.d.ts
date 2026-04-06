// TypeScript declaration merging for Express Request
declare namespace Express {
    interface Request {
        hybridAuthMessage?: import('../src/validation/paragon.schema').ParagonExecuteInput;
    }
}
