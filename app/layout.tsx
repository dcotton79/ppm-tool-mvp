import './globals.css';
import Link from 'next/link';
import { getServerSession } from 'next-auth';

export const metadata = { title: 'PPM Tool', description: 'Agile MVP' };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <header style={{ padding: 12, borderBottom: '1px solid #eee', display:'flex', gap:16, alignItems:'center' }}>
          <a href="/">PPM</a> | <a href="/projects">Projects</a>
          <span style={{ marginLeft: 'auto' }}>
            {session?.user ? (
              <>
                <span style={{ opacity: .7, marginRight: 8 }}>Hi, {session.user.name || session.user.email}</span>
                <form action="/api/auth/signout" method="post" style={{ display: 'inline' }}>
                  <button>Sign out</button>
                </form>
              </>
            ) : (
              <Link href="/login">Sign in</Link>
            )}
          </span>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
