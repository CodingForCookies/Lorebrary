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

        // For use when we change how the database is formatted.
        this.version = opts.version || 1;

        this.driver = opts.driver || 'browser';

        this.name = opts.name || 'Unnamed';
        
        this.description = opts.description || '';
    }

    copy() {
        return new Universe(this.toObject());
    }

    toObject() {
        return {
            id: this.id,
            version: this.version,
            name: this.name,
            description: this.description
        };
    }

    async save() {
        console.debug('Universe#save', this.toObject());

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

        this.type = opts.type || null;
        this.parent = opts.parent || null;
        
        this.glyph = opts.glyph || 'box';
        this.image = opts.image || null
        this.tags = opts.tags || [];

        this.mentions = [];
    }

    toObject() {
        return {
            ...super.toObject(),
            ...{
                type: this.type,
                parent: this.parent,
        
                glyph: this.glyph,
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
        console.debug('Article#save', this.toObject());
  
        await wait();
  
        return await driver(this).getStore().saveArticle(this.toObject());
    }

    async delete(retainChildren) {
        console.debug('Article#delete');
  
        await wait();
  
        await driver(this).getStore().deleteArticle({
            universe: this.universe,
            id: this.id
        }, retainChildren);
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
  
        let results = await driver({ universe: opts.universe }).getStore().findArticles(opts);

        return results.map(v => new Article(v));
    }
}

export class Story {
    constructor(opts) {
        opts = opts || { };
        
        opts.universe = opts.universe || store.state.universeSelected;
        
        if(!opts.universe)
            throw new Error('Attempted to create a Story with no Universe!');

        this.isNew = !opts.id;

        this.id = opts.id || uuid.v4();
        this.universe = opts.universe;

        this.title = opts.title || '';
        this.tags = opts.tags || [];
        this.description = opts.description || '';

        this.chapters = opts.chapters || [];
    }

    toObject() {
        return {
            universe: this.universe,
            id: this.id,
    
            title: this.title,
            tags: this.tags,
            description: this.description,

            chapters: this.chapters
        };
    }

    copy() {
        return new Story(this.toObject());
    }

    async save() {
        console.debug('Story#save', this.toObject());
  
        await wait();
  
        return await driver(this).getStore().saveStory(this.toObject());
    }

    async delete() {
        console.debug('Story#delete');
  
        await wait();
  
        await driver(this).getStore().deleteStory({
            universe: this.universe,
            id: this.id
        });
    }

    static async get(opts) {
        opts = opts || { };

        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Story.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getStory(opts);

        if(!result) throw new Error('No Story found.')

        return new Story(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Story.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().findStories(opts);

        return results.map(v => new Story(v));
    }
}

export class Chapter extends Entry {
    constructor(opts) {
        super(opts);

        opts = opts || { };

        if(!opts.story)
            throw new Error('Attempted to create a Chapter with no Story!');

        this.story = opts.story;
    }

    toObject() {
        return {
            ...super.toObject(),
            ...{
                story: this.story
            }
        };
    }

    copy() {
        return new Chapter(this.toObject());
    }

    async save() {
        console.debug('Chapter#save', this.toObject());
  
        await wait();
  
        return await driver(this).getStore().saveChapter(this.toObject());
    }

    async delete() {
        console.debug('Chapter#delete');
  
        await wait();
  
        await driver(this).getStore().deleteChapter({
            universe: this.universe,
            id: this.id
        });
    }

    static async get(opts) {
        opts = opts || { };

        if(!opts.universe) opts.universe = store.state.universeSelected;

        if(!opts.story)
            throw new Error('Attempted to get a Chapter with no Story!');

        console.debug('Chapter.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getChapter(opts);

        if(!result) throw new Error('No Chapter found.')

        return new Chapter(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        if(!opts.story)
            throw new Error('Attempted to find Chapters with no Story!');

        console.debug('Chapter.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().findChapters(opts);
        
        return results.map(v => new Chapter(v));
    }
}

export class Note extends Entry {
    constructor(opts) {
        super(opts);
    }

    copy() {
        return new Note(this.toObject());
    }

    async save() {
        console.debug('Note#save', this.toObject());
  
        await wait();
  
        return await driver(this).getStore().saveNote(this.toObject());
    }

    async delete() {
        console.debug('Note#delete');
  
        await wait();
  
        await driver(this).getStore().deleteNote({
            universe: this.universe,
            id: this.id
        });
    }

    static async get(opts) {
        opts = opts || { };

        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Note.get', opts);
  
        await wait();
  
        let result = await driver({ universe: opts.universe }).getStore().getNote(opts);

        if(!result) throw new Error('No Note found.')

        return new Note(result);
    }

    static async find(opts) {
        opts = opts || {};
        
        if(!opts.universe) opts.universe = store.state.universeSelected;
      
        console.debug('Note.find', opts);
  
        await wait();
  
        let results = await driver({ universe: opts.universe }).getStore().findNotes(opts);

        return results.map(v => new Note(v));
    }
}

export class Resource {
    constructor(opts) {
        opts = opts || { };
        
        opts.universe = opts.universe || store.state.universeSelected;
        
        if(!opts.universe)
            throw new Error('Attempted to create a Resource with no Universe!');

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
        console.debug('Resource#save', this.toObject());
  
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
  
        let results = await driver({ universe: opts.universe }).getStore().findResources(opts);

        return results.map(v => new Resource(v));
    }
}