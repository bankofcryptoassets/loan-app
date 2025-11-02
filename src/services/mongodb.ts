import { MongoClient, Db } from 'mongodb';
import { DatabaseConfig } from '../types/config';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(cfg: DatabaseConfig): Promise<Db> {
    const uri = cfg.uri;
    if (!uri) {
        throw new Error(
            'No MongoDB connection information provided in configuration'
        );
    }

    client = new MongoClient(uri);
    await client.connect();

    db = client.db(cfg.name);
    return db;
}

export function getDb(): Db {
    if (!db) throw new Error('MongoDB not connected');
    return db;
}

export async function closeMongo(): Promise<void> {
    if (client) {
        await client.close();
        client = null;
        db = null;
    }
}

export function isConnected(): boolean {
    return !!client && !!db;
}
