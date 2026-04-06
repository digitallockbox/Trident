export const emailService = {
    send: async (_to: string, _subject: string, _body: string) => {
        return { sent: true };
    },
};
