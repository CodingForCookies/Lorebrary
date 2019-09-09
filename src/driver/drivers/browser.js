import { Driver, Store } from '../index';
import { rejects } from 'assert';

const Datastore = require('nedb');

/*db.insert({ planet: 'Earth' }, function (err) {
    db.find({ }, function (err, docs) {
        // docs contains the two planets Earth and Mars
    });
});*/

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export class BrowserStore extends Store {
    constructor() {
        super();
        
        this.universes = new Datastore('universes');
        this.articles = new Datastore('articles');
        this.notes = new Datastore('notes');
        this.resources = new Datastore('resources');
    }

    async init() {
        this.universes.loadDatabase();
        this.articles.loadDatabase();
        this.notes.loadDatabase();
        this.resources.loadDatabase();
    }


    getUniverses() {
        return new Promise(resolve => this.universes.find({ }, (err, result) => resolve(result)));
    }

    getUniverse(id) {
        return new Promise(resolve => this.universes.findOne({ id }, (err, result) => {
            if(!result) return resolve(null);

            resolve(result);
        }));
    }

    async saveUniverse(universe) {
        this.universes.update({
            id: universe.id
        }, universe, {
            upsert: true
        });
    }

    async deleteUniverse(id) {
        this.universes.remove({ id });
    }

    getArticles(opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.articles.find(opts, {
                id: 1,
                type: 1,
                icon: 1,
                name: 1,
                tags: 1,
                parent: 1
            }, (err, result) => {
                let articles = { };
                for(let article of result) {
                    articles[article.id] = article;
                }

                this.articles.find({ $or: result.map(v => ({ parent: v.id })) }, { parent: 1 }, (err, result2) => {
                    for(let article of result2) {
                        if(!articles[article.parent].children)
                            articles[article.parent].children = [];
                    }

                    resolve(result);
                });
            });
        });
    }
    
    getArticle(opts) {
        return new Promise((resolve, reject) => {
            this.articles.findOne(opts, (err, result) => {
                if(!result) return resolve(null);

                if(!result.mentions) {
                    return resolve(result);
                }
                
                let mentions = {};
                for(let ment of result.mentions) {
                    mentions[ment.id] = ment;
                }

                // Update the mentions. This could be done on article save, however since
                // we don't care too much about queries, as they're pretty much instant,
                // just do it here.
                this.articles.find({
                    universe: result.universe,
                    $or: result.mentions.map(v => ({ id: v.id }))
                }, { id: 1, name: 1 }, (err, result2) => {
                    for(let article of result2) {
                        mentions[article.id].label = article.name;
                    }

                    resolve(result);
                });
            });
        });
    }

    async saveArticle(article) {
        return new Promise(resolve => {
            this.articles.update({
                universe: article.universe,
                id: article.id
            }, article, {
                upsert: true
            }, (err) => {
                resolve();
            });
        });
    }

    async deleteArticle(opts) {
        if(opts.retainChildren) {
            let article = await this.getArticle(opts);

            this.articles.remove(opts);
            this.articles.update({ universe: opts.universe, parent: opts.id }, {
                $set: {
                    parent: article.parent
                }
            }, { upsert: true });
        }else{
            let promises = [];

            let children = await this.getArticles(opts);

            // Remove all children. This is recursive.
            for(let child of children) {
                promises.push(await this.deleteArticle({
                    universe: opts,
                    id: child.id,
                    retainChildren: false
                }));
            }
            
            this.articles.remove(opts);

            await Promise.all(promises);
        }
    }
    
    async getArticleMentions(opts) {
        return new Promise(resolve => {
            this.articles.find({
                universe: opts.universe,
                'mentions.id': opts.id
            }, {
                id: 1,
                type: 1,
                icon: 1,
                name: 1,
                tags: 1
            }, (err, result) => {
                resolve(result);
            });
        });
    }


    getNotes(opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.notes.find(opts, {
                id: 1,
                name: 1
            }, (err, result) => {
                resolve(result);
            });
        });
    }
    
    getNote(opts) {
        return new Promise((resolve, reject) => {
            this.notes.findOne(opts, (err, result) => {
                if(!result) return resolve(null);
                resolve(result);
            });
        });
    }

    async saveNote(note) {
        return new Promise(resolve => {
            this.notes.update({
                universe: note.universe,
                id: note.id
            }, note, {
                upsert: true
            }, (err) => {
                resolve();
            });
        });
    }

    async deleteNote(opts) {
        this.notes.remove(opts);
    }

    
    getResources(opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.resources.find(opts, (err, result) => {
                let resources = { };
                for(let resource of result) {
                    resources[resource.id] = resource;
                }
                resolve(resources);
            });
        });
    }

    getResource(opts) {
        return new Promise(resolve => this.resources.findOne(opts, (err, result) => {
            if(!result) return resolve(null);

            resolve(result);
        }));
    }

    async saveResource(resource) {
        this.resources.update({
            universe: resource.universe,
            id: resource.id
        }, resource, {
            upsert: true
        });
    }

    async deleteResource(opts) {
        this.resources.remove(opts);
    }
}

export default class BrowserDriver extends Driver {
    constructor(id) {
        super(id, {
            icon: 'fas fa-sticky-note',
            name: 'Browser Storage',
            info: {
                description: 'Saves the universe to a your browser\'s local storage.',
                good: [
                    'No storage limit (with permission)'
                ],
                bad: [
                    'No live collaboration tools',
                    'Might not persist across sessions'
                ],
            }
        });

        this.store = new BrowserStore();

        this.capabilities = {
            'image.blob': false // Don't allow storing image blobs. Not enough space.
        };
    }

    isEnabled() {
        return true;
    }

    async init() {
        await this.store.init();
    }

    isAccessible() {
        return true;
    }
}