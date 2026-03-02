import { NextRequest, NextResponse } from 'next/server';
import {
    CreateMultipartUploadCommand,
    UploadPartCommand,
    CompleteMultipartUploadCommand,
    AbortMultipartUploadCommand,
    ListPartsCommand,
    PutObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from '@/lib/s3';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === 'create') {
            const { filename, type } = body;
            const key = `depo/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

            const command = new CreateMultipartUploadCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: type,
            });

            const response = await s3Client.send(command);
            return NextResponse.json({ uploadId: response.UploadId, key });
        }

        if (action === 'signStandard') {
            const { filename, type } = body;
            const key = `depo/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;

            const command = new PutObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                ContentType: type || 'application/octet-stream',
            });

            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return NextResponse.json({ url });
        }

        if (action === 'signPart') {
            const { key, uploadId, partNumber } = body;

            const command = new UploadPartCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                UploadId: uploadId,
                PartNumber: partNumber,
            });

            // Sign URL for part
            const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
            return NextResponse.json({ url });
        }

        if (action === 'listParts') {
            const { key, uploadId } = body;

            const command = new ListPartsCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                UploadId: uploadId,
            });

            const response = await s3Client.send(command);
            return NextResponse.json({
                parts: response.Parts?.map((p) => ({
                    PartNumber: p.PartNumber,
                    Size: p.Size,
                    ETag: p.ETag?.replace(/"/g, ''),
                })) || [],
            });
        }

        if (action === 'complete') {
            const { key, uploadId, parts } = body;

            const command = new CompleteMultipartUploadCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                UploadId: uploadId,
                MultipartUpload: {
                    Parts: parts.map((p: any) => ({
                        PartNumber: p.PartNumber,
                        ETag: `"${p.ETag.replace(/"/g, '')}"`, // AWS expects quotes around ETag
                    })),
                },
            });

            await s3Client.send(command);
            return NextResponse.json({ success: true });
        }

        if (action === 'abort') {
            const { key, uploadId } = body;

            const command = new AbortMultipartUploadCommand({
                Bucket: BUCKET_NAME,
                Key: key,
                UploadId: uploadId,
            });

            await s3Client.send(command);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Multipart API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
