import { Driver } from '../index';

export default class GoogleDriver extends Driver {
    constructor(id) {
        super(id, {
            icon: 'fab fa-google-drive',
            name: 'Google Drive',
            info: {
                description: 'Saves the universe to a database in google drive.',
                good: [
                    'Syncs across machines and workspaces'
                ],
                bad: [
                    'No live collaboration tools',
                    'May run in to sync issues'
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