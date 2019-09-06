import Vue from 'vue'
import Vuex from 'vuex'

import uuid from 'uuid';
import drivers from './driver/';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    window: {
      frame: false,
      miniDrawer: true
    },
    startup: {
      is: true,

      stages: {

      }
    },

    // Small amount of information of all available universes. All other data is loaded on-demand.
    universes: null,

    universeLoading: false,
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
    },
    driver(state, getters) {
      if(!getters.universe) throw new Error('Attempted to access the driver of an invalid universe!');
      if(!getters.universe.driver) throw new Error('Attempted to access the driver of a universe with no driver!');

      return drivers[getters.universe.driver];
    },
  },

  mutations: {
    setStartupStage(state, [id, stage]) {
      Vue.set(state.startup.stages, id, stage);
    },

    setUniverses(state, universes) {
      state.universes = universes;
    },
    setUniverse(state, universe) {
      Vue.set(state.universes, universe.id, universe);
      state.universeSelected = universe.id;
    },
    setCurrentUniverse(state, universe) {
      state.universeSelected = universe ? universe.id : null;
    }
  },
  actions: {
    async doStartup(store) {
      await doStartup(store);
    },

    async loadUniverses({ commit }) {
      let promises = [];

      let universes = { };

      for(let [id, driver] of Object.entries(drivers)) {
        if(!driver.isEnabled()) continue;

        promises.push(driver.getStore().getUniverses().then(data => {
          for(let universe of data) {
            universe.driver = id;
            universes[universe.id] = {
              driver: id,
              id: universe.id,
              name: universe.name,
              description: universe.description
            }
          }
        }));
      }

      await Promise.all(promises);

      commit('setUniverses', universes);
    }, async loadUniverse({ commit, state }, universeId) {
      if(state.universeSelected == universeId) return;

      let universe = universeId ? state.universes[universeId] : null;
      let driver = universe ? drivers[universe.driver] : null;

      if(!driver) {
        state.universeSelected = null;
        return;
      }

      state.universeLoading = true;

      let data = await driver.getStore().getUniverse(universeId);

      commit('setCurrentUniverse', data);
      
      state.universeLoading = false;
    }, async saveUniverse({ commit, getters }, universe) {
      if(!universe.id) {
        universe.id = uuid.v4();
      }

      commit('setUniverse', universe);

      await getters.driver.getStore().saveUniverse(universe.id, {
        id: universe.id,
        name: universe.name,
        description: universe.description
      });
    },

    async getArticlesOfType({ commit, state, getters }, opts) {
      opts = opts || {};
      
      return await getters.driver.getStore().getArticlesOfType(state.universeSelected, opts);
    },

    async getArticle({ commit, state, getters }, opts) {
      opts = opts || {};
      
      return await getters.driver.getStore().getArticle(state.universeSelected, opts);
    },
    
    async saveArticle({ commit, state, getters }, article) {
      if(!article.id) {
        article.id = uuid.v4();
      }

      await getters.driver.getStore().saveArticle(state.universeSelected, {
        id: article.id,
        
        type: article.type,
        parent: article.parent,

        icon: article.icon,
        image: article.image,
        name: article.name,
        tags: article.tags,
        content: article.content
      });
    }, async deleteArticle({ commit, state, getters }, opts) {
      opts = opts || {};
      
      await getters.driver.getStore().deleteArticle(state.universeSelected, opts);
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