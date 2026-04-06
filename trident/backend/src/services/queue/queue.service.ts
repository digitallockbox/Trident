export const queueService = {
    enqueue: async (_job: unknown) => {
        return { queued: true };
    },
};
