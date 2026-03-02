'use client';

import { useState } from 'react';
import { Download, Trash2, File, Loader2 } from 'lucide-react';

interface FileData {
    key: string;
    size: number;
    lastModified: string;
    url: string;
}

interface FileListProps {
    files: FileData[];
    loading: boolean;
    onRefresh: () => void;
}

export default function FileList({ files, loading, onRefresh }: FileListProps) {
    const [deleting, setDeleting] = useState<string | null>(null);

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const deleteFile = async (key: string) => {
        if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;

        setDeleting(key);
        try {
            const res = await fetch('/api/files', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key }),
            });
            if (res.ok) {
                onRefresh();
            } else {
                alert('Dosya silinemedi!');
            }
        } catch (e) {
            alert('Hata oluştu.');
        } finally {
            setDeleting(null);
        }
    };

    if (loading && files.length === 0) {
        return (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto', color: 'var(--accent-color)' }} />
            </div>
        );
    }

    return (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Dosyalarım</h2>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {files.length} dosya bulundu
                </div>
            </div>

            {files.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <File size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
                    <p>Henüz dosya yüklenmemiş.</p>
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>İsim</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Boyut</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Tarih</th>
                                <th style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-secondary)', textAlign: 'right' }}>İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {files.map((file) => (
                                <tr key={file.key} style={{ borderTop: '1px solid var(--surface-border)', transition: 'background 0.2s ease', cursor: 'default' }} className="file-row">
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <File size={20} style={{ color: 'var(--accent-color)' }} />
                                            <span style={{ fontWeight: 500, wordBreak: 'break-all' }}>
                                                {file.key.replace('depo/', '').split('-').slice(1).join('-') || file.key.replace('depo/', '')}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>{formatSize(file.size)}</td>
                                    <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                                        {new Date(file.lastModified).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <a href={file.url} download target="_blank" rel="noopener noreferrer" className="btn-icon" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-hover)', padding: '8px', borderRadius: 'var(--radius-sm)', display: 'inline-flex' }}>
                                                <Download size={18} />
                                            </a>
                                            <button
                                                onClick={() => deleteFile(file.key)}
                                                disabled={deleting === file.key}
                                                className="btn-icon"
                                                style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', padding: '8px', borderRadius: 'var(--radius-sm)', display: 'inline-flex', border: 'none', cursor: 'pointer' }}
                                            >
                                                {deleting === file.key ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <style dangerouslySetInnerHTML={{
                __html: `
        .file-row:hover { background: rgba(255, 255, 255, 0.03); }
        .btn-icon:hover { opacity: 0.8; transform: scale(1.05); }
        .btn-icon { transition: all 0.2s ease; }
      `}} />
        </div>
    );
}
