import * as shared from '@syncspace/shared';
// importing config
import { PORT } from './config/env.config.js';
// importing app
import app from './app.js';
// importing lib
import { connectToDb } from './lib/mongoose.lib.js';

try {
    const { sharedStr } = shared;
    console.log(sharedStr);

    await connectToDb();

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to initialize app. Check database connection or port availability \n', error);
}