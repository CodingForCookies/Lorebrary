import uuid from 'uuid';

import store from './store';
import drivers from './driver/';

async function wait() {
    return new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
}

function driver(obj) {
    let driver = drivers[obj.driver || store.state.universes[obj.universe].driver];

    if(!driver) {
        throw new Error('Unknown driver \'' + obj.driver + '\'!');
    }

    return driver;
}

export class Universe {
    constructor(opts) {
        opts = opts || { };

        this.id = opts.id || uuid.v4();

        this.driver = opts.driver || 'browser';

        this.name = opts.name || 'Unnamed';
        
        this.description = opts.description || '';
    }

    toObject() {
        return {
            id: this.id,
            name: this.name,
            description: this.description
        };
    }

    async save() {
        console.debug('Universe#save');

        await wait();
  
        return await driver(this).getStore().saveUniverse(this.toObject());
    }

    async delete() {
        console.debug('Universe#delete');
  
        await wait();
  
        // TODO:
        throw new Error('Unimplemented');
    }

    static async get(driverId, universeId) {
        console.debug('Universe.get', universeId);

        await wait();
  
        let result = await driver(driverId).getStore().getUniverse(universeId);

        if(!result) throw new Error('No Universe found.')

        return new Universe(result);
    }
}

class Entry {
    constructor(opts) {
        opts = opts || { };
        
        opts.universe = opts.universe || store.state.universeSelected;
        
        if(!opts.universe)
            throw new Error('Attempted to create an entry with no Universe!');

        this.isNew = !opts.id;

        this.id = opts.id || uuid.v4();
        this.universe = opts.universe;

        this.name = opts.name || '';

        this.content = opts.content || [];
    }

    toObject() {
        return {
            universe: this.universe,
            id: this.id,
    
            name: this.name,
            
            content: this.content
        };
    }
}

export class Article extends Entry {
    constructor(opts) {
        super(opts);

        this.category = opts.category || null;
        this.parent = opts.parent || null;
        
        this.icon = opts.icon || 'box';
        this.image = opts.image || null
        this.tags = opts.tags || [];

        this.mentions = [];
    }

    toObject() {
        return {
            ...super.toObject(),
            ...{
                type: 'article',

                category: this.category,
                parent: this.parent,
        
                icon: this.icon,
                image: this.image,
                tags: this.tags,
                mentions: this.mentions
            }
        };
    }

    copy() {
        return new Article(this.toObject());
    }

    async getMentionedIn() {
        console.debug('Article#getMentionedIn');
  
        await wait();
  
        let results = await driver(this).getStore().getArticleMentions({
            universe: this.universe,
            id: this.id
        });

        return results.map(v => new Article(v));
    }

    async save() {
        console.debug('Entry#save');
  
        await wait();
  
        return await driver(this).getStore().saveArticle(this.toObject());
    }

    async delete(opts) {
        console.debug('Entry#delete');
  
        await wait();
  
        await driver(this).getStore().deleteArticle({
            ...opts,
            ...{
                universe: this.universe,
                id: this.id
            }
        });
    }

    static async get(opts) {
        opts = opts || { };

        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Entry.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getArticle(opts);

        if(!result) throw new Error('No Article found.')

        return new Article(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Entry.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().getArticles(opts);

        return results.map(v => new Article(v));
    }
}

export class Note extends Entry {
    constructor(opts) {
        super(opts);
    }

    toObject() {
        return {
            ...super.toObject(),
            ...{
                type: 'note'
            }
        };
    }

    copy() {
        return new Note(this.toObject());
    }

    async save() {
        console.debug('Entry#save');
  
        await wait();
  
        return await driver(this).getStore().saveNote(this.toObject());
    }

    async delete(opts) {
        console.debug('Entry#delete');
  
        await wait();
  
        await driver(this).getStore().deleteNote({
            ...opts,
            ...{
                universe: this.universe,
                id: this.id
            }
        });
    }

    static async get(opts) {
        opts = opts || { };

        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Entry.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getNote(opts);

        if(!result) throw new Error('No Note found.')

        return new Note(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Entry.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().getNotes(opts);

        return results.map(v => new Note(v));
    }
}

export class Resource {
    constructor(opts) {
        opts = opts || { };
        
        opts.universe = opts.universe || store.state.universeSelected;
        
        if(!opts.universe)
            throw new Error('Attempted to create a resource with no Universe!');

        this.isNew = !opts.id;

        this.id = opts.id || uuid.v4();
        this.universe = opts.universe;

        this.type = opts.type || null;
        this.name = this.name || 'Unnamed';
        this.tags = this.tags || [];
        
        this.src = this.src || null;
    }

    toObject() {
        return {
            universe: this.universe,
            id: this.id,
            
            type: this.type,
            name: this.name,
            tags: this.tags,
            
            src: this.src
        };
    }

    copy() {
        return new Resource(this.toObject());
    }

    async save() {
        console.debug('Resource#save');
  
        await wait();
  
        return await driver(this).getStore().saveResource(this.toObject());
    }

    async delete() {
        console.debug('Resource#delete');
  
        await wait();
  
        await driver(this).getStore().deleteResource(this.universe, {
            universe: this.universe,
            id: this.id
        });
    }

    static async get(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;

        console.debug('Resource.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getResource(opts);

        if(!result) throw new Error('No Resource found.')

        return new Resource(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Resource.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().getResources(opts);

        return results.map(v => new Resource(v));
    }
}