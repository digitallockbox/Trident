import { StreamStartRequest, StreamStopRequest, Stream, StreamStartResponse, StreamStopResponse } from "./types/streams";
import axios from "axios";

// Start a stream
export async function startStream(payload: StreamStartRequest): Promise<StreamStartResponse> {
    const { data } = await axios.post("/api/streams/start", payload);
    return data;
}

// Stop a stream
export async function stopStream(payload: StreamStopRequest): Promise<StreamStopResponse> {
    const { data } = await axios.post("/api/streams/stop", payload);
    return data;
}

// List streams
export async function listStreams(): Promise<Stream[]> {
    const { data } = await axios.get("/api/streams/list");
    return data;
}
