import useSWR from 'swr';
import api from '@/lib/axios'; // Adjust path if needed or use relative

export const useAuth = () => {

    const { data: user, error, mutate, isLoading: swrIsLoading } = useSWR('/api/auth/me', () => {
        console.log('SWR: Fetching user...');
        return api.get('/api/auth/me')
            .then(res => {
                console.log('SWR: User loaded:', res.data.data);
                return res.data.data;
            })
            .catch(error => {
                if (error.response?.status !== 401) {
                    console.error('SWR: Error fetching user:', error);
                    throw error;
                }
                console.log('SWR: User not authenticated (401)');
                return null;
            });
    }, {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        shouldRetryOnError: false,
    });

    const csrf = () => api.get('/sanctum/csrf-cookie');

    const login = async (arg1: any, arg2?: string) => {
        console.log('Login: Starting process...');
        await csrf();

        let props: any;
        let setErrors: any;

        if (typeof arg1 === 'object' && !arg2) {
            ({ setErrors, ...props } = arg1);
        } else {
            props = { email: arg1, password: arg2 };
        }

        if (setErrors) setErrors([]);

        try {
            console.log('Login: Sending credentials...', props.email);
            await api.post('/api/auth/login', props);
            console.log('Login: API success, revalidating user...');
            const result = await mutate();
            console.log('Login: Revalidation result:', result);
            return result;
        } catch (error: any) {
            console.error('Login: API error:', error.response?.data);
            if (setErrors && error.response?.status === 422) {
                setErrors(error.response.data.errors);
            }
            throw error;
        }
    };

    const register = async (props: any) => {
        console.log('Register: Starting process...', props.email);
        await csrf();
        try {
            const response = await api.post('/api/auth/register', props);
            console.log('Register: API success:', response.data);
            const userData = response.data.data || response.data;
            await mutate(userData, false);
            console.log('Register: Local state updated (optimistic)');
            return response.data;
        } catch (error: any) {
            console.error('Register: API error:', error.response?.data);
            throw error;
        }
    };

    const logout = async () => {
        console.log('Logout: Starting process...');
        // 1. Vider le state SWR immédiatement
        await mutate(null, false);
        console.log('Logout: Local state cleared');

        // 2. Nettoyer le stockage local au cas où un token y resterait
        localStorage.clear();

        try {
            // 3. Appeler le serveur pour invalider la session (Cookie)
            await api.post('/api/auth/logout');
            console.log('Logout: API success');
        } catch (error) {
            console.error('Logout: API error:', error);
        }

        console.log('Logout: Redirecting to /connexion');
        // 4. Redirection propre et forcée
        window.location.href = '/connexion';
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
