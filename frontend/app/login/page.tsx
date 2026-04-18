const handleLogin = async () => {
  if (!email) return toast.error('Please enter your email');
  setLoading(true);
  setDebugInfo('');
  try {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const apiUrl = rawApiUrl.replace(/\/$/, '');

    const res = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (!res.ok) {
      setDebugInfo(`Error: ${res.status} - ${data.detail || 'Unknown error'}`);
      throw new Error(data.detail || 'Login failed');
    }

    setAuth(data.token, data.user);
    toast.success('Logged in!');

    // ✅ Wait one tick for Zustand persist to write to localStorage
    //    before navigating — prevents the race condition
    await new Promise((resolve) => setTimeout(resolve, 100));
    router.push('/dashboard');

  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : 'Login failed. Check your email.';
    setDebugInfo(`${errorMsg}`);
    toast.error(errorMsg);
  } finally {
    setLoading(false);
  }
};