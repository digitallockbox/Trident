export interface Engine {
    execute(payload: any): Promise<any>;
}
