<template>
  <v-container fluid class="py-0 fill-height">
    <v-card-text v-if="!codex"
        class="my-4 text-center">
      <v-progress-circular
        :size="32"
        :width="2"
        color="primary"
        indeterminate />
    </v-card-text>
    <v-layout row v-else>
      <v-flex xs12 md3>
        <v-card dark flat tile outlined color="blue-grey darken-4" class="fill-height codex-list">
          <v-layout row no-gutters>
            <v-flex v-for="([icon, name], id) in types" :key="icon" no-gutters>
              <v-btn text block tile :height="64" @click="type = id"
                  :to="{ name: 'Codex', params: { universe: $route.params.universe, type: id }}"
                  exact>
                <div class="text-center">
                  <v-icon small>fas fa-{{ icon }}</v-icon>
                  <div class="mt-2 overline">{{ name }}</div>
                </div>
              </v-btn>
            </v-flex>
          </v-layout>

          <v-text-field
            v-model="search.text"
            label="Search..."
            filled
            hide-details
            full-width
            clearable
            clear-icon="fas fa-close-circle" />

          <v-divider />

          <v-card-text>
            <v-treeview style="cursor:pointer"
              :search="search.text"
              :filter="filterTree"
              :active.sync="active"
              :open.sync="open"
              :items="codex"
              v-model="tree"
              item-key="id"
              hoverable
              activatable
              dense>
              <template v-slot:prepend="{ item, open }">
                <v-icon small :class="item.children ? 'pl-3' : ''">
                  fas fa-{{ item.icon }}
                </v-icon>
              </template>
              <template v-slot:append="{ item, open }">
                <v-btn small icon @click.stop="newArticle(item)">
                  {{ (articleParent ? articleParent.id : null) != item.id ? '+' : 'o' }}
                </v-btn>
              </template>
            </v-treeview>
          </v-card-text>
        </v-card>
      </v-flex>
      <v-flex xs12 md9 lg6>
        <v-card light flat tile class="fill-height">
          <v-layout column
              class="fill-height">
            <v-card-title>
              <v-text-field
                class="display-1"
                placeholder="Title"
                v-model="article.name"
                single-line
                full-width
                :readonly="!isEditing"
                :hide-details="!article || !article.parent"
                :hint="article.parent ? 'Child of \'' + (articleParent || codexMap[article.parent]).name + '\'' : null"
                persistent-hint>
                <template v-slot:prepend>
                  <v-icon>
                    fas fa-{{ article.icon }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-card-title>

            <v-card-text v-if="!article.content" class="my-4 text-center">
              <v-progress-circular
                :size="32"
                :width="2"
                color="primary"
                indeterminate />
            </v-card-text>

            <editor v-else
              ref="editor"
              class="pa-4"
              v-model="article.content"
              :readonly="!isEditing"
              @mention="loadArticle" />

            <v-btn v-if="this.active.length > 0"
              absolute
              top right
              min-width="60"
              min-height="60"
              dark depressed tile
              :ripple="false"
              @click="toggleEditing">
              <v-icon>fas fa-{{ isEditing ? 'eye' : 'pencil-alt' }}</v-icon>
            </v-btn>
          </v-layout>
        </v-card>
      </v-flex>
      <v-navigation-drawer
        v-model="$store.state.window.rightDrawer"
        absolute right
        temporary>
        <article-info
            :is-editing="isEditing"
            :article="article"
            :article-image="articleImage"
            @image="image.dialog = true"
            @delete="deleting.dialog = true" />
      </v-navigation-drawer>
      <v-flex md3 class="d-none d-lg-block">
        <v-card flat tile :color="$vuetify.theme.dark ? 'blue-grey darken-4' : 'rgba(0, 0, 0, .07)'" class="fill-height">
          <article-info
            :is-editing="isEditing"
            :article="article"
            :article-image="articleImage"
            @image="image.dialog = true"
            @delete="deleting.dialog = true" />
        </v-card>
      </v-flex>
    </v-layout>

    <v-snackbar
      v-model="unsaved"
      bottom
      :timeout="0">
      You have unsaved changes!
      <v-btn dark text color="primary" @click="saveArticle">
        Save
      </v-btn>
    </v-snackbar>
    
    <image-editor
      v-if="image.dialog"
      :visible.sync="image.dialog"
      v-model="article.image"
      selection />
    
    <v-dialog
      v-model="deleting.dialog"
      :persistent="deleting.loading"
      width="500">
      <v-card v-if="deleting.loading" class="text-center">
        <v-progress-circular
          class="ma-4"
          :size="32"
          :width="2"
          color="primary"
          indeterminate />
      </v-card>
      <v-card v-else>
        <v-card-title
          class="headline"
          primary-title>
          Delete '{{ article.name }}'?
        </v-card-title>

        <v-card-text class="pt-3 pb-0">
          This action cannot be undone!
        </v-card-text>

        <v-card-actions class="px-6">
          <v-checkbox
            label="Delete Children"
            v-model="deleting.children" />

          <v-spacer />

          <v-btn
            color="error"
            text small
            @click="deleteArticle">
            I'm sure
          </v-btn>

          <v-btn
            color="primary"
            depressed
            @click="deleting.dialog = false">
            No, please!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
  import Editor from '../../components/Editor.vue'
  import ImageEditor from '../../components/ImageEditor.vue'
  
  import ArticleInfo from './ArticleInfo.vue'

  export default {
    components: { Editor, ImageEditor, ArticleInfo },
    data: () => ({
      search: {
        text: '',
        tags: []
      },

      types: {
        places: ['city', 'Places'],
        beings: ['user', 'Beings'],
        things: ['box', 'Things'],
        other: ['book', 'Codex']
      },
      type: null,

      active: [],

      tree: [],
      open: [],

      codexMap: { },
      codex: null, /*[
        {
          id: 'cities',
          name: 'Cities',
          icon: 'city',
          children: [
            {
              id: 'citadel',
              name: 'The Citadel',
              icon: 'city',
            }
          ]
        },
        {
          id: 'important-peoples',
          name: 'Important Peoples',
          icon: 'users',
        },
        {
          id: 'politics',
          name: 'Politics',
          icon: 'vote-yea',
        },
        {
          id: 'religions',
          name: 'Religions',
          icon: 'bible',
          children: [
            {
              id: 'church-of-thwomp',
              name: 'Church of Thwomp',
              icon: 'square',
              children: [
                {
                  id: 'seven-commandments',
                  name: 'Seven Commandments'
                },
                {
                  id: 'church-beliefs',
                  name: 'Beliefs'
                }
              ],
            },
            {
              id: 'followers-of-rook',
              name: 'Followers of Rook',
              icon: 'chess-rook',
              children: [
                {
                  id: 'rook-beliefs',
                  name: 'Beliefs'
                }
              ],
            }
          ],
        }
      ],*/

      article: {
        type: 'other',
        parent: null,

        icon: 'box',
        name: '',
        tags: [],
        content: []
      },
      articleImage: null,
      articleParent: null,

      editing: false,
      image: {
        dialog: false
      },
      deleting: {
        dialog: false,
        loading: false,
        children: false
      },

      unsaved: false,
      ignoreChanges: false
    }),
    computed: {
      isEditing() {
        return this.active.length == 0 || !!this.editing;
      }
    },

    watch: {
      type(val, oldVal) {
        if(val == oldVal) return;

        this.reloadCodex();
        this.newArticle();
      },
      '$route.params.article'(val) {
        if(this.article.id == val) return;
        this.loadArticle(val);
      },

      'deleting.dialog'(val) {
        if(val) {
          this.deleting.loading = false;
        }
      },

      article: {
        deep: true,
        handler(val, oldVal) {
          if(this.ignoreChanges) return;
          this.unsaved = val.id == oldVal.id;
        }
      },
      async 'article.image'(val) {
        this.articleImage = (val ? await this.$store.dispatch('getResource', val) : null);
      },

      async active(vals) {
        if(this.ignoreChanges) return;

        if(!vals.length) {
          this.newArticle();
          return;
        }
        
        this.articleParent = null;
        
        this.article = await this.$store.dispatch('getArticle', vals[0]);

        if(this.article)
          this.$router.push({ name: 'Codex', params: Object.assign(this.$route.params, { type: this.article.type, article: this.article.id }) });
        else{
          this.newArticle();
        }
      }
    },

    methods: {
      filterTree(item, filter) {
        filter = filter.toLowerCase();
        return item.name.toLowerCase().includes(filter) || item.tags.some(v => v.toLowerCase().indexOf(filter) !== -1);
      },
      /*async fetchChildren(item) {
        this.ignoreChanges = true;

        item.children = [];

        for(let child of await this.$driver.getStore().getArticles(item.id)) {
          child._parent = item;

          item.children.push(child);
        }

        this.ignoreChanges = false;
      },*/

      async loadArticle(id) {
        this.active = [ id ];
      },

      async reloadCodex() {
        let dict = await this.$store.dispatch('getArticles', { type: this.type });

        this.codexMap = dict;
        this.codex = [];
        
        // Merge the lists
        for(let [id, article] of Object.entries(dict)) {
          if(!article.parent) {
            this.codex.push(article);
          }else{
            let parent = dict[article.parent];
            if(!parent.children) parent.children = [];
            parent.children.push(article);
          }
        }
      },

      toggleEditing(e) {
        this.editing = !this.editing;

        // Doesn't always work, but it's fine.
        this.$nextTick(() => {
          e.target.parentElement.parentElement.blur();
        });
      },

      newArticle(parent) {
        this.ignoreChanges = true;

        this.article = {
          type: this.type,
          parent: parent ? parent.id : null,
          
          icon: 'box',
          name: '',
          tags: [],
          content: []
        };
        this.articleParent = parent;
        
        this.active = [];

        this.unsaved = false;

        setTimeout(() => {
          this.ignoreChanges = false;
        }, 1);
      },
      async saveArticle() {
        this.ignoreChanges = true;

        let isNew = this.active.length == 0;

        if(isNew) {
          // this.codex = null;
        }
        
        await this.$store.dispatch('saveArticle', this.article);

        // Refresh the list
        // TODO: only refresh when adding. We do this for now so that titles and icons will update correctly.
        await this.reloadCodex();

        this.active = [ this.article.id ];

        if(isNew) {
          // Allow editing since we just created a new article
          this.editing = true;
        }

        this.unsaved = false;

        setTimeout(() => {
          this.ignoreChanges = false;
        }, 1);
      },
      async deleteArticle() {
        this.deleting.loading = true;
        
        await this.$store.dispatch('deleteArticle', { id: this.article.id, retainChildren: !this.deleting.children });

        // Refresh the list
        await this.reloadCodex();

        this.deleting.dialog = false;

        await this.newArticle();
      }
    },
    mounted() {
      if(!this.$route.params.type) {
        this.$router.replace({ name: 'Codex', params: Object.assign(this.$route.params, { type: 'other' }) });
      }
      
      this.type = this.$route.params.type;

      if(this.$route.params.article) {
        this.loadArticle(this.$route.params.article);
      }
    }
  }
</script>

<style>
  .codex-list {
    color: #FFF !important;
  }

  .codex-list .v-tabs > .v-tabs-bar {
    background-color: #202a2e !important;

    border-bottom: 1px solid rgba(0, 0, 0, .1);
  }

  .codex-list .v-treeview > .v-treeview-node--leaf > .v-treeview-node__root {
    color: #FFF !important;
  }

  .codex-list .v-treeview .v-treeview-node--active::before {
    background-color: #FFF !important;
  }

  .codex-list .v-treeview .v-treeview-node--active .v-treeview-node__label {
    color: #FFF !important;
  }

  .codex-list .v-treeview-node__root.v-treeview-node--active .v-treeview-node__content .v-icon {
    color: #FFF;
  }
</style>