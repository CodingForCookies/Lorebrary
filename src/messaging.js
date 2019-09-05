import store from './store';

let parent = null;

function send(type, payload) {
    if(!parent) return;

    if(payload === undefined) payload = null;

    parent.postMessage(JSON.stringify({ type, payload }), '*');
}

let handlers = {
    isReady(payload) {
        return { type: 'ready', payload: true };
    },
    'doStartup'() {
        store.dispatch('doStartup');
    },
    'isStartedUp'() {
        return !store.state.startup.is;
    }
};

window.addEventListener('message', (event) => {
    // Only allow file-based messages. This is for electron support.
    if(!event.origin.startsWith('file://')) return;

    // Set the event source
    parent = event.source;

    let { type, payload } = JSON.parse(event.data);

    if(handlers.hasOwnProperty(type)) {
        let reply = handlers[type](payload);

        if(reply) {
            if(reply.type) {
                send(reply.type, reply.payload);
            }else{
                send(type, reply);
            }
        }
    }
});