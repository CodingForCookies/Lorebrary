import { Driver } from '../index';

export default class OnlineDriver extends Driver {
    constructor(id) {
        super(id, {
            icon: 'fas fa-globe',
            name: 'Online Storage',
            info: {
                description: 'Saves the universe to your online Lorebrary account.',
                good: [
                    'Syncs across machines and workspaces',
                    'Live collaboration tools'
                ],
                bad: [
                    'Storage size is subscription based'
                ]
            }
        });
    }

    isEnabled() {
        return false;
    }

    async init() {
        throw new Error('No credentials.');
    }

    isAccessible() {
        return false;
    }
}