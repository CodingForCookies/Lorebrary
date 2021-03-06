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
        this.capabilities = [];
    }

    getStore() {
        return this.store;
    }

    getCapabilities() {
        return this.capabilities;
    }

    hasCapability(id) {
        return !!this.capabilities[id];
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
     * This should return all universes, but only their Universe{ id, name, description }.
     */
    async findUniverses() { return []; }
    
    async getUniverse(id) { return null; }

    async saveUniverse(universe) { }

    async deleteUniverse(id) { }

    
    async findArticles(opts) { return null; }
    
    async getArticle(opts) { return null; }

    async saveArticle(article) { }

    async deleteArticle(opts, retainChildren) { }

    async getArticleMentions(opts) { return null; }

    
    async findStories(opts) { }

    async getStory(opts) { }

    async saveStory(story) { }

    async deleteStory(opts) { }


    async findNotes(opts) { }

    async getNote(opts) { }

    async saveNote(note) { }

    async deleteNote(opts) { }


    /**
     * Return all resources of Resource{ type }. Resources are not expected to return the full content in this array.
     */
    async findResources(universe, opts) { }

    /**
     * Return the requested resource in its entirety.
     */
    async getResource(universe, id) { }

    async saveResource(universe, resource) { }

    /**
     * Removes a resource. This doesn't do any cleanup, so we should verify all usages of getResource.
     */
    async deleteResource(universe, opts) { }
}

// TODO: Allow creating multiple credentials for a single driver. i.e. store two universes in two different google drive accounts.
export default {
    online: new (require('./drivers/online').default)('online'),
    drive: new (require('./drivers/drive').default)('drive'),
    browser: new (require('./drivers/browser').default)('browser')
}