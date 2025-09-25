import mongoose from 'mongoose';
// importing config
import { MONGODB_URI } from '../config/env.config.js';
// importing constants
import { DB_NAME } from '../data/constants.js';

export const connectToDb = async () => {
    try {
        await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Connection to MongoDB failed \n', error);
        process.exit(1);
    }
};