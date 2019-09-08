import { Driver, Store } from '../index';

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
        
        this.resources = new Datastore('resources');
    }

    async init() {
        this.universes.loadDatabase();
        this.articles.loadDatabase();
        
        this.resources.loadDatabase();
    }


    getUniverses() {
        return new Promise(resolve => this.universes.find({ }, (err, result) => resolve(result)));
    }

    getUniverse(id) {
        return new Promise(resolve => this.universes.findOne({ }, (err, result) => resolve(result)));
    }

    async saveUniverse(id, data) {
        this.universes.update({ id }, data, {
            upsert: true
        });
    }

    async deleteUniverse(id) {
        this.universes.remove({ id });
    }

    getArticles(universe, opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.articles.find({
                ...{ universe },
                ...opts
            }, {
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

                    resolve(articles);
                });
            });
        });
    }
    
    getArticle(universe, id) {
        return new Promise(resolve => {
            this.articles.findOne({ universe, id }, (err, result) => {
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

    async saveArticle(universe, article) {
        return new Promise(resolve => {
            this.articles.update({ universe, id: article.id }, {
                ...{ universe },
                ...article
            }, {
                upsert: true
            }, (err) => {
                resolve();
                // Update all articles that mention this one

                // The library we use doesn't allow easily doing this in a single query. However,
                // since we're doing it locally, speed and efficiency doesn't matter much.

                this.articles.find({
                    'mentions.id': article.id
                }, { id: 1, name: 1 })
            });
        });
    }

    async deleteArticle(universe, opts) {
        if(opts.retainChildren) {
            let article = await this.getArticle(universe, opts.id);

            this.articles.remove({ universe, id: opts.id });
            this.articles.update({ universe, parent: opts.id }, {
                $set: {
                    parent: article.parent
                }
            }, { upsert: true });
        }else{
            let promises = [];

            let children = await this.getArticles(universe, opts.id);

            // Remove all children. This is recursive.
            for(let child of children) {
                promises.push(await this.deleteArticle(universe, { id: child.id, retainChildren: false }));
            }
            
            this.articles.remove({ universe, id: opts.id });

            await Promise.all(promises);
        }
    }
    
    async getArticleMentions(universe, id) {
        return new Promise(resolve => {
            this.articles.find({
                universe, id
            }, { id: 1, type: 1, icon: 1, name: 1, tags: 1 }, (err, result2) => {
                resolve(result);
            });
        });
    }

    
    getResources(universe, opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.resources.find({
                ...{ universe },
                ...opts
            }, (err, result) => {
                let resources = { };
                for(let resource of result) {
                    resources[resource.id] = resource;
                }
                resolve(resources);
            });
        });
    }

    getResource(universe, id) {
        return new Promise(resolve => this.resources.findOne({ universe, id }, (err, result) => resolve(result)));
    }

    async saveResource(universe, resource) {
        this.resources.update({ universe, id: resource.id }, {
            ...{ universe },
            ...resource
        }, {
            upsert: true
        });
    }

    async deleteResource(universe, id) {
        this.resources.remove({ universe, id });
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