import { Driver } from '../index';

export default class GoogleDriver extends Driver {
    constructor(id) {
        super(id, {
            icon: 'fab fa-dropbox',
            name: 'Dropbox',
            info: {
                description: 'Saves the universe to a database in dropbox.',
                good: [
                    'Syncs across machines and workspaces'
                ],
                bad: [
                    'No live collaboration tools',
                    'May run in to sync issues',
                    'Little storage available'
                ]
            }
        });
    }

    isEnabled() {
        return false;
    }

    async init() {
        
    }

    isAccessible() {
        return false;
    }
}