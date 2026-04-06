export interface Snapshot {
  id: string;
  engineName: string;
  timestamp: Date;
  data: Record<string, any>;
}
