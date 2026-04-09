import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Create a new stream (draft state)
export async function createStream({
    creatorId,
    title,
    category
}: {
    creatorId: string;
    title: string;
    category?: string;
}) {
    const streamId = uuidv4();
    const stream = await prisma.stream.create({
        data: {
            id: streamId,
            creatorId,
            title,
            category,
            status: 'DRAFT',
        },
    });
    // Generate publishToken and playbackUrl
    const publishToken = uuidv4();
    const playbackUrl = `/streams/${streamId}/live.m3u8`;
    await prisma.stream.update({
        where: { id: streamId },
        data: { publishToken, playbackUrl },
    });
    return {
        streamId,
        publishToken,
        playbackUrl,
        stream: { ...stream, publishToken, playbackUrl },
    };
}

// Go live with a stream
export async function goLive({
    streamId
}: {
    streamId: string;
}) {
    // Simulate Omega engine call (replace with real integration)
    const playbackUrl = `/streams/${streamId}/live.m3u8`;
    const stream = await prisma.stream.update({
        where: { id: streamId },
        data: { status: 'LIVE', playbackUrl },
    });
    return { stream, playbackUrl };
}

// End a stream
export async function endStream({
    streamId
}: {
    streamId: string;
}) {
    // Mark as ended and clear playbackUrl/publishToken
    const stream = await prisma.stream.update({
        where: { id: streamId },
        data: { status: 'ENDED', playbackUrl: null, publishToken: null },
    });
    // Simulate resource cleanup (e.g., notify Omega, revoke tokens)
    return { stream };
}
