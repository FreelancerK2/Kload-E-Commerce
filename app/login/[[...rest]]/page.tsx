'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SimpleLoginForm from '@/components/SimpleLoginForm';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError('');

    try {
      // For demo purposes, let's simulate a login
      console.log('Login attempt:', { email, password });

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For demo: accept any email/password combination
      if (email && password) {
        // Store user info in localStorage (for demo purposes)
        localStorage.setItem(
          'user',
          JSON.stringify({
            email,
            name: email.split('@')[0],
            isLoggedIn: true,
          })
        );

        // Redirect to home page
        router.push('/');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}
      <SimpleLoginForm />
    </div>
  );
}
