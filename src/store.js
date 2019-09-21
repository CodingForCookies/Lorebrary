import Vue from 'vue'
import Vuex from 'vuex'

import drivers from './driver/';
import { Universe } from './lorebrary';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    window: {
      frame: false,
      miniDrawer: true,
      rightDrawer: false
    },
    startup: {
      is: true,

      stages: {

      }
    },

    universes: null,

    universeSelected: null
  },
  getters: {
    universeList(state) {
      if(!state.universes) throw new Error('Universe list is null!');

      return Object.values(state.universes);
    },

    universe(state) {
      if(!state.universes) throw new Error('No universe selected!');

      return state.universes[state.universeSelected];
    }
  },

  mutations: {
    setStartupStage(state, [id, stage]) {
      Vue.set(state.startup.stages, id, stage);
    },

    setUniverses(state, universes) {
      state.universes = universes;
    },
    setCurrentUniverse(state, universe) {
      state.universeSelected = universe ? universe.id : null;
    }
  },
  actions: {
    async doStartup(store) {
      await doStartup(store);
    },

    hasCapability({ commit }, id) {
      return getters.driver.getStore().hasCapability(id);
    },

    async loadUniverses({ commit }) {
      console.debug('loadUniverses');

      let promises = [];

      let universes = { };

      for(let [id, driver] of Object.entries(drivers)) {
        if(!driver.isEnabled()) continue;

        promises.push(driver.getStore().findUniverses().then(data => {
          for(let universe of data) {
            universe.driver = id;
            
            universes[universe.id] = new Universe({
              ...universe,
              ...{ driver: id }
            })
          }
        }));
      }

      await Promise.all(promises);

      commit('setUniverses', universes);
    }
  }
})

async function doStartup({ dispatch, commit, state }) {
  // Add all stages immediately
  for(let [id, driver] of Object.entries(drivers)) {
    if(!driver.isEnabled()) continue;

    commit('setStartupStage', ['driver-' + id, {
      status: null
    }]);
  }

  // Now process the stages
  for(let [id, driver] of Object.entries(drivers)) {
    if(!driver.isEnabled()) continue;

    try {
      await driver.init();

      commit('setStartupStage', ['driver-' + id, {
        status: 'done'
      }]);
    } catch(e) {
      commit('setStartupStage', ['driver-' + id, {
        status: 'error'
      }]);
    }
  }

  await dispatch('loadUniverses');

  state.startup.is = false;
}