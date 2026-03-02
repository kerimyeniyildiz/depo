'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Cloud } from 'lucide-react';
import Uploader from '@/components/Uploader';
import FileList from '@/components/FileList';

export default function Dashboard() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/files');
            if (res.ok) {
                const data = await res.json();
                setFiles(data.files);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        router.push('/login');
    };

    return (
        <main style={{ minHeight: '100vh', padding: '2rem 5%' }}>
            <header className="glass-panel" style={{ padding: '1rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ background: 'var(--accent-gradient)', padding: '8px', borderRadius: 'var(--radius-sm)' }}>
                        <Cloud size={24} style={{ color: '#fff' }} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Depo</h1>
                </div>
                <button
                    onClick={handleLogout}
                    style={{ background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px 16px', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }}
                    className="logout-btn"
                >
                    <LogOut size={18} />
                    Çıkış Yap
                </button>
            </header>

            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Uploader onUploadSuccess={fetchFiles} />
                <FileList files={files} loading={loading} onRefresh={fetchFiles} />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .logout-btn:hover { background: rgba(255,255,255,0.05); color: var(--text-primary) !important; }
      `}} />
        </main>
    );
}
