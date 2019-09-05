import { Driver } from '../index';

export default class DiskDriver extends Driver {
    constructor(id) {
        super(id, {
            icon: 'fas fa-hdd',
            name: 'Hard Drive',
            info: {
                description: 'Saves the universe to your hard drive.',
                good: [
                    'No storage limit'
                ],
                bad: [
                    'No live collaboration tools'
                ],
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