import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { mySchema } from './schema';
import User from '../models/User';

const adapter = new SQLiteAdapter({
    schema: mySchema,
    // (You might want to comment out migrations if you haven't created them yet)
    // migrations, 
    onSetUpError: error => {
        // Database failed to load -- offer the user to reload the app or log out
        console.error(error);
    },
});

export const database = new Database({
    adapter,
    modelClasses: [User],
});
