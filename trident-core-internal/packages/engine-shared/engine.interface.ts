// Shared engine interface for all internal engines
export interface Engine {
    execute(payload: any): Promise<any>;
}
