'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function Login() {
  const [email, setEmail] = useState('alex@example.com');
  const [name, setName] = useState('Alex Dev');
  return (
    <div style={{ maxWidth: 420 }}>
      <h1>Sign in</h1>
      <form onSubmit={(e)=>{e.preventDefault(); signIn('credentials',{ email, name, callbackUrl: '/projects'});}}
            style={{ display: 'grid', gap: 8 }}>
        <label>Email <input value={email} onChange={e=>setEmail(e.target.value)} /></label>
        <label>Name <input value={name} onChange={e=>setName(e.target.value)} /></label>
        <button type="submit">Continue</button>
      </form>
    </div>
  );
}
