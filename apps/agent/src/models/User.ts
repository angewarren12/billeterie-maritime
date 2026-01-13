import { Model } from '@nozbe/watermelondb';
import { field, date } from '@nozbe/watermelondb/decorators';

export default class User extends Model {
    static table = 'users';

    @field('name') name!: string;
    @field('email') email!: string;
    @field('token') token!: string;
    @field('role') role!: string;
    @date('created_at') createdAt!: number;
    @date('updated_at') updatedAt!: number;
}
