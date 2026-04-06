import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { startStream, stopStream, listStreams } from "../api/streams";
import { StreamStartRequest, StreamStopRequest } from "../api/types/streams";

export function useStreams() {
    const queryClient = useQueryClient();

    const { data: streams, ...rest } = useQuery(["streams"], listStreams);

    const start = useMutation((payload: StreamStartRequest) => startStream(payload), {
        onSuccess: () => queryClient.invalidateQueries(["streams"])
    });

    const stop = useMutation((payload: StreamStopRequest) => stopStream(payload), {
        onSuccess: () => queryClient.invalidateQueries(["streams"])
    });

    return { streams, start, stop, ...rest };
}
