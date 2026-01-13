import useSWR from 'swr';
import api from '@/lib/axios'; // Adjust path if needed or use relative

export const useAuth = () => {

    const { data: user, error, mutate, isLoading: swrIsLoading } = useSWR('/api/auth/me', () =>
        api.get('/api/auth/me')
            .then(res => res.data.data)
            .catch(error => {
                if (error.response?.status !== 401) throw error;
                return null;
            }),
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
            onError: (err) => {
                // Silently ignore 401 errors - they're expected for unauthenticated users
                if (err?.response?.status === 401) return;
                console.error('Auth error:', err);
            }
        }
    );

    const csrf = () => api.get('/sanctum/csrf-cookie');

    const login = async (arg1: any, arg2?: string) => {
        await csrf();

        let props: any;
        let setErrors: any;

        if (typeof arg1 === 'object' && !arg2) {
            // Called as login({ setErrors, email, password })
            ({ setErrors, ...props } = arg1);
        } else {
            // Called as login(email, password)
            props = { email: arg1, password: arg2 };
        }

        if (setErrors) setErrors([]);

        try {
            await api.post('/api/auth/login', props);
            await mutate(); // Revalidate user and WAIT for it
        } catch (error: any) {
            if (setErrors && error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
            throw error; // Re-throw to allow component to handle it
        }
    };

    const register = async (props: any) => {
        await csrf();
        const response = await api.post('/api/auth/register', props);
        const userData = response.data.data || response.data;
        mutate(userData, false); // Update state immediately without waiting for revalidation
        return response.data;
    };

    const logout = async () => {
        if (!error) {
            await api.post('/auth/logout');
            mutate();
        }
        window.location.pathname = '/login';
    };

    return {
        user,
        login,
        register,
        logout,
        refreshUser: mutate,
        isLoading: swrIsLoading || (user === undefined && !error),
        isLogged: !!user
    };
};
