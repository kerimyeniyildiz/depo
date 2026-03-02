'use client';

import { useEffect, useState } from 'react';
import Uppy from '@uppy/core';
// @ts-ignore
import Dashboard from '@uppy/react/dashboard';
import AwsS3 from '@uppy/aws-s3';

import '@uppy/core/css/style.css';
import '@uppy/dashboard/css/style.css';

interface UploaderProps {
    onUploadSuccess: () => void;
}

export default function Uploader({ onUploadSuccess }: UploaderProps) {
    const [uppy, setUppy] = useState<Uppy | null>(null);

    useEffect(() => {
        const uppyInstance = new Uppy({
            id: 'depo-uploader',
            autoProceed: false,
            restrictions: {
                maxFileSize: 50 * 1024 * 1024 * 1024, // 50 GB
            },
        }).use(AwsS3, {
            limit: 4,
            // In newer Uppy versions with AwsS3, we can provide custom functions for multipart:
            getUploadParameters(file) {
                return { method: 'POST', url: '', fields: {} };
            },
            shouldUseMultipart: (file) => (file.size || 0) > 100 * 1024 * 1024, // >100MB uses multipart
            // Multipart API Implementation
            async createMultipartUpload(file) {
                const res = await fetch('/api/multipart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'create', filename: file.name, type: file.type }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                return { uploadId: data.uploadId, key: data.key };
            },
            async signPart(file, partData) {
                const res = await fetch('/api/multipart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'signPart',
                        uploadId: partData.uploadId,
                        key: partData.key,
                        partNumber: partData.partNumber,
                    }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                return { url: data.url };
            },
            async listParts(file, { uploadId, key }) {
                const res = await fetch('/api/multipart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'listParts', uploadId, key }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                return data.parts;
            },
            async completeMultipartUpload(file, { uploadId, key, parts }) {
                const res = await fetch('/api/multipart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'complete', uploadId, key, parts }),
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);
                return { location: `/${key}` }; // S3 return location
            },
            async abortMultipartUpload(file, { uploadId, key }) {
                await fetch('/api/multipart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'abort', uploadId, key }),
                });
            },
        });

        uppyInstance.on('complete', (result) => {
            if (result.successful && result.successful.length > 0) {
                onUploadSuccess();
            }
        });

        setUppy(uppyInstance);

        return () => {
            // @ts-ignore
            uppyInstance.destroy ? uppyInstance.destroy() : uppyInstance.close && uppyInstance.close({ reason: 'unmount' });
        };
    }, [onUploadSuccess]);

    if (!uppy) return null;

    return (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Dosya Yükle</h2>
            <Dashboard
                uppy={uppy}
                theme="dark"
                width="100%"
                height={350}
                proudlyDisplayPoweredByUppy={false}
            />
        </div>
    );
}
