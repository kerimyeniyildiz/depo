import { NextRequest, NextResponse } from 'next/server';
import { ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client, BUCKET_NAME, PUBLIC_URL } from '@/lib/s3';

export async function GET() {
    try {
        const command = new ListObjectsV2Command({
            Bucket: BUCKET_NAME,
            Prefix: 'depo/',
        });

        const response = await s3Client.send(command);

        const files = response.Contents?.filter(item => item.Key !== 'depo/').map((item) => ({
            key: item.Key,
            size: item.Size,
            lastModified: item.LastModified,
            url: `${PUBLIC_URL}/${item.Key}`,
        })).sort((a, b) => (b.lastModified?.getTime() || 0) - (a.lastModified?.getTime() || 0)) || [];

        return NextResponse.json({ files });
    } catch (error: any) {
        console.error('List Files Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { key } = await req.json();

        if (!key) {
            return NextResponse.json({ error: 'Key is required' }, { status: 400 });
        }

        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await s3Client.send(command);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete File Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
