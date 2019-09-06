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
    }

    async init() {
        this.universes.loadDatabase();
        this.articles.loadDatabase();
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

    async getArticlesOfType(universe, opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.articles.find({
                ...{ universe },
                ...opts
            }, (err, result) => resolve(result))
        });
    }

    async getArticles(universe, opts) {
        if(opts.search !== undefined) {
            opts.name = new RegExp(escapeRegex(opts.search), 'gi');
            delete opts.search;
        }

        return new Promise(resolve => {
            this.articles.find({
                ...{ universe },
                ...opts
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
    
    async getArticle(universe, id) {
        return new Promise(resolve => this.articles.findOne({ universe, id }, (err, result) => resolve(result)));
    }

    async saveArticle(universe, article) {
        this.articles.update({ universe, id: article.id }, {
            ...{ universe },
            ...article
        }, {
            upsert: true
        });
    }

    async deleteArticle(universe, opts) {
        if(opts.retainChildren) {
            let article = await this.getArticle(opts.id);

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