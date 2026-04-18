// ✅ FIXED: Only redirect to login if we're not already on login page
// and only after hydration is confirmed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login';
      const isHydrated = useAuthStore.getState()._hasHydrated;

      // Only clear and redirect if hydration is done and we're not on login page
      if (isHydrated && !isLoginPage) {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);