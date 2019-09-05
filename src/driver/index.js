// A list of storage drivers. isAccessible should determine if the driver can be used.
const DEFAULT_STORE = new Proxy({ }, {
    get(target, name) {
        return new Promise(() => {
            throw new Error('Unsupported store function \'' + name + '\'');
        });
    }
});

export class Driver {
    constructor(id, opts) {
        this.id = id;

        this.icon = opts.icon;
        this.name = opts.name;
        this.info = opts.info;

        this.store = opts.store || DEFAULT_STORE;

        // Additional capabilities beyond basic storage
        this.capabilities = { };
    }

    getStore() {
        return this.store;
    }

    getCapabilities() {
        return this.capabilities;
    }

    getCapability(id) {
        return this.capabilities[id];
    }

    // Return true if enough configuration has been done for this storage driver to be enabled.
    isEnabled() {
        return false;
    }

    // Init the driver. Log in to storage, set up databases, etc. Throw an error to disable the driver.
    async init() {
        
    }

    // Return true if the driver is ready to be used for storage.
    isAccessible() {
        return false;
    }
}

export class Store {
    /**
     * This should return all universes, but only their { id, name, description }.
     */
    async getUniverses() { return []; }
    
    async getUniverse(id) { return null; }

    async saveUniverse(id, data) { }

    async deleteUniverse(id) { }

    /**
     * args: { type, search }
     * Returns all articles marked with the specified { type }
     */
    async getArticlesOfType(universe, opts) { return null; }
    
    /**
     * args: { type, search }
     * Returns the articles that are a child of the defined parent. If parent is null, return all articles with no parent.
     * This should return { id, icon, name, children? }.
     */
    async getArticles(universe, opts) { return null; }
    
    async getArticle(universe, id) { return null; }

    async saveArticle(universe, article) { }

    /**
     * Find all articles with this as a parent and update them according to the second parameter.
     * true: set them to the removed article's parent.
     * false: remove them as well.
     */
    async deleteArticle(universe, opts) { }
}

// TODO: Allow creating multiple credentials for a single driver. i.e. store two universes in two different google drive accounts.
export default {
    online: new (require('./drivers/online').default)('online'),
    google: new (require('./drivers/google').default)('google'),
    dropbox: new (require('./drivers/dropbox').default)('dropbox'),
    drive: new (require('./drivers/drive').default)('drive'),
    browser: new (require('./drivers/browser').default)('browser')
}