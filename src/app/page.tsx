import Link from "next/link";
import { FolderUp } from "lucide-react";

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <FolderUp size={64} style={{ color: 'var(--accent-color)', margin: '0 auto 1.5rem auto' }} />
        <h1 className="title-glow" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Depo</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          Güvenli, hızlı ve kesintisiz dosya depolama alanı. 50 GB'a kadar boyutlarda dosyalarınızı yükleyin ve yönetin.
        </p>
        <Link href="/dashboard" className="btn-primary" style={{ display: 'inline-block', padding: '12px 32px', fontSize: '1.1rem' }}>
          Giriş Yap
        </Link>
      </div>
    </main>
  );
}
