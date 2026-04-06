import { z } from 'zod';

export const PodcastPayloadSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(2000).optional(),
    host: z.string().min(1).max(100),
    guests: z.array(z.string().min(1).max(100)).optional(),
    publishDate: z.string().datetime().optional(),
    audioUrl: z.string().url(),
    durationSeconds: z.number().int().positive(),
    tags: z.array(z.string().max(30)).max(10).optional(),
    livestreamId: z.string().min(1), // Link to livestream lab session
});

export type PodcastPayload = z.infer<typeof PodcastPayloadSchema>;

export interface PodcastResult {
    ok: boolean;
    message: string;
    data?: any;
    error?: string;
}
