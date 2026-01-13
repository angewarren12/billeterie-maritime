import axios from 'axios';
import { database } from '../database';
import User from '../models/User';

const API_URL = 'http://localhost:8000/api'; // Configure via Env later

export const authService = {
    login: async ({ email, password }: any) => {
        try {
            // 1. Online Login
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            }, {
                headers: { 'X-Platform': 'mobile' } // Request Token
            });

            const { token, data: userData } = response.data;

            // 2. Save to WatermelonDB (Offline)
            await database.write(async () => {
                const usersCollection = database.get<User>('users');

                // Clear previous users (Single User Mode for now)
                const allUsers = await usersCollection.query().fetch();
                const batch = allUsers.map(u => u.prepareDestroyPermanently());

                // Create new user
                const newUser = usersCollection.prepareCreate(user => {
                    user.name = userData.name;
                    user.email = userData.email;
                    user.token = token;
                    user.role = userData.role || 'agent';
                });

                await database.batch(...batch, newUser);
            });

            return userData;
        } catch (error) {
            console.error('Login Failed', error);
            throw error;
        }
    },

    getCurrentUser: async () => {
        try {
            // 1. Check Offline DB
            const users = await database.get<User>('users').query().fetch();
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            return null;
        }
    },

    logout: async () => {
        await database.write(async () => {
            const users = await database.get<User>('users').query().fetch();
            const batch = users.map(u => u.prepareDestroyPermanently());
            await database.batch(...batch);
        });
    }
};
