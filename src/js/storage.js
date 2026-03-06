const DB_NAME = 'snapRecycleDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

class BrowserStorage {
    constructor() {
        this.dbPromise = this.openDB();
    }

    openDB() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject(new Error('IndexedDB non supportato in questo browser.'));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error || new Error('Errore apertura IndexedDB.'));
        });
    }

    async add(key, value) {
        if (!key) throw new Error('Chiave mancante.');
        if (typeof value !== 'object' || value === null) {
            throw new Error('Il valore deve essere un oggetto.');
        }

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.put(value, key);

            request.onsuccess = () => resolve(value);
            request.onerror = () => reject(request.error || new Error('Errore salvataggio valore.'));
        });
    }

    async get(key) {
        if (!key) throw new Error('Chiave mancante.');

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error || new Error('Errore lettura valore.'));
        });
    }

    async delete(key) {
        if (!key) throw new Error('Chiave mancante.');

        const db = await this.dbPromise;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error || new Error('Errore eliminazione valore.'));
        });
    }
}

window.browserStorage = new BrowserStorage();
