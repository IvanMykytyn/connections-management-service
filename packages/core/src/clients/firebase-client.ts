import { App, AppOptions, initializeApp } from 'firebase-admin/app';
import { Database, getDatabase } from 'firebase-admin/database';

export class FirebaseClient {
    private app: App | undefined = undefined;
    private database: Database | undefined = undefined;

    constructor(firebaseConfig: AppOptions) {
        this.app = initializeApp(firebaseConfig);
        this.database = getDatabase(this.app);
    }
    /**
     * Getting a snapshot of data in RTDB based on given path
     *
     * @param path
     * @returns snapshot of the data, if not exists will return undefined
     */
    public async get<T>(path: string): Promise<T | null> {
        if (!this.database) return null;
        const snapshot = await this.database.ref(path).get();
        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            return null;
        }
    }

    /**
     * Set data in RTDB based on the given path
     *
     * @param path
     * @param obj
     */
    public async set<T>(path: string, obj: T) {
        if (!this.database) return null;
        await this.database.ref(path).set(obj);
    }
}
