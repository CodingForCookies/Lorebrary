<template>
  <v-container fluid fill-height no-gutters class="pa-0">
    <v-row
        no-gutters
        class="fill-height">
      <v-col cols="12" md="4" lg="3">
        <v-card dark flat tile outlined color="blue-grey darken-4" class="fill-height codex-list">
          <v-row no-gutters>
            <v-col v-for="([icon, name], id) in types" :key="icon">
              <v-btn text block tile :height="64" @click="type = id"
                  :to="{ name: 'Codex', params: { universe: $route.params.universe, type: id }}">
                <div class="text-center">
                  <v-icon small>fas fa-{{ icon }}</v-icon>
                  <div class="mt-2 overline">{{ name }}</div>
                </div>
              </v-btn>
            </v-col>
          </v-row>

          <v-text-field
            v-model="search.text"
            label="Search..."
            filled
            hide-details
            full-width
            clearable
            clear-icon="fas fa-close-circle" />

          <v-divider />

          <v-card-text v-if="!articles"
              class="text-center">
            <v-progress-circular
              :size="32"
              :width="2"
              indeterminate />
          </v-card-text>
          <v-card-text v-else>
            <v-treeview style="cursor:pointer"
              :search="search.text"
              :filter="filterTree"
              :active.sync="active"
              :open.sync="open"
              :items="articles"
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
      </v-col>
      <template v-if="!article">
        <v-col cols="12" md="8" lg="9">
          <v-row align="center" justify="center" class="fill-height">
            <v-progress-circular
              :size="64"
              :width="4"
              color="primary"
              indeterminate />
          </v-row>
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12" md="8" lg="6">
          <v-card light flat tile class="fill-height">
            <v-col
                class="fill-height">
              <v-card-title>
                <v-text-field
                  class="display-1"
                  placeholder="Title"
                  v-model="article.name"
                  single-line
                  full-width
                  :readonly="saving || !isEditing"
                  :hide-details="!article || !article.parent"
                  :hint="article.parent ? 'Child of \'' + (articleParent || articleMap[article.parent]).name + '\'' : null"
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
                v-model="article"
                :readonly="saving || !isEditing"
                allow-mentions
                @mention="loadArticle"
                min-height="350" />

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
            </v-col>
          </v-card>
        </v-col>
        <v-navigation-drawer
          v-model="$store.state.window.rightDrawer"
          absolute right
          temporary>
          <article-info
              :is-editing="!saving && isEditing"
              :article="article"
              :article-image="articleImage"
              @image="image.dialog = true"
              @mentions="mentions.dialog = true"
              @delete="deleting.dialog = true" />
        </v-navigation-drawer>
        <v-col lg="3" class="d-none d-lg-block">
          <v-card flat tile :color="$vuetify.theme.dark ? 'blue-grey darken-4' : 'rgba(0, 0, 0, .07)'" class="fill-height">
            <article-info
              :is-editing="!saving && isEditing"
              :article="article"
              :article-image="articleImage"
              @image="image.dialog = true"
              @mentions="mentions.dialog = true"
              @delete="deleting.dialog = true" />
          </v-card>
        </v-col>
      </template>
    </v-row>

    <v-snackbar
      v-model="unsaved"
      bottom
      :timeout="0">
      You have unsaved changes!
      <v-btn
        dark text color="primary"
        :loading="saving"
        @click="saveArticle">
        Save
      </v-btn>
    </v-snackbar>
    
    <image-editor
      v-if="image.dialog"
      :visible.sync="image.dialog"
      v-model="article.image"
      selection />
    
    <v-dialog
      v-if="article"
      v-model="mentions.dialog"
      width="500">
      <v-card v-if="!!article">
        <v-card-title
          class="headline"
          primary-title>
          Mentioned in:
        </v-card-title>

        <v-card-text v-if="!mentions.articles">
          This article is not @mentioned anywhere.
        </v-card-text>
        <v-list v-else>
          <v-list-item
            v-for="(article, i) in mentions.articles"
            :key="i"
            @click="mentions.dialog = false; loadArticle(article.id)">
            <v-list-item-avatar>
              <v-icon>fas fa-{{ article.icon }}</v-icon>
            </v-list-item-avatar>

            <v-list-item-content>
              <v-list-item-title>{{ article.name }}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-card-actions>
          <v-spacer />
          <v-btn
            color="primary"
            text
            @click="mentions.dialog = false">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <v-dialog
      v-if="article"
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

      articleMap: { },
      articles: null, /*[
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

      article: null,
      articleImage: null,
      articleParent: null,

      editing: false,
      saving: false,
      image: {
        dialog: false
      },
      mentions: {
        dialog: false,
        articles: []
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
      // If the type changes, refresh the sidebar with the new items
      async type(val, oldVal) {
        if(val == oldVal) return;

        await this.reloadArticles();
        
        // If an article is selected, go to it.
        if(this.$route.params.article) {
          await this.loadArticle(this.$route.params.article);
        }else
          // Otherwise, reset the article editor.
          this.newArticle();
      },

      // If the article parameter changes, load the new article.
      '$route.params.article'(val) {
        if(this.article.id == val) return;
        this.loadArticle(val);
      },

      article: {
        deep: true,
        handler(val, oldVal) {
          if(this.ignoreChanges) return;
          this.unsaved = val.id == oldVal.id;
        }
      },
      async 'article.image'(val) {
        this.articleImage = (val ? await this.$lb.Resource.get({ id: val }) : null);
      },

      'deleting.dialog'(val) {
        if(val) {
          this.deleting.loading = false;
        }
      },
      async 'mentions.dialog'(val) {
        if(!val) return;

        this.mentions.articles = [];

        this.mentions.articles = await this.article.getMentionedIn();
      },

      async active(vals) {
        if(this.ignoreChanges) return;

        if(!vals.length) {
          this.newArticle();
          return;
        }

        this.loadArticle(vals[0]);
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

      toggleEditing(e) {
        this.editing = !this.editing;

        // Doesn't always work, but it's fine.
        this.$nextTick(() => {
          e.target.parentElement.parentElement.blur();
        });
      },

      async loadArticle(id) {
        this.ignoreChanges = true;

        this.article = null;

        // Update the active tree item
        this.active = id ? [ id ] : [ ];

        this.articleParent = null;
        
        this.article = await this.$lb.Article.get({ id });

        if(this.article) {
          this.$router.push({ name: 'Codex', params: Object.assign(this.$route.params, { type: this.article.type, article: this.article.id }) });
        }else{
          this.newArticle();
        }
        
        setTimeout(() => {
          this.ignoreChanges = false;
        }, 1);
      },

      async reloadArticles(inPlaceReload) {
        if(!inPlaceReload) {
          this.articles = null;
          this.article = null;
        }

        let articles = await this.$lb.Article.find({ type: this.type });

        this.articleMap = { };

        for(let article of articles) {
          this.articleMap[article.id] = article;
        }

        this.articles = [];
        
        // Merge the lists
        for(let [id, article] of Object.entries(this.articleMap)) {
          if(!article.parent) {
            this.articles.push(article);
          }else{
            let parent = this.articleMap[article.parent];
            if(!parent.children) parent.children = [];
            parent.children.push(article);
          }
        }
      },

      newArticle(parent) {
        this.ignoreChanges = true;

        this.article = new (this.$lb.Article)({ type: this.type });
        this.articleParent = parent;
        
        this.active = [];

        this.unsaved = false;

        setTimeout(() => {
          this.ignoreChanges = false;
        }, 1);
      },
      async saveArticle() {
        this.ignoreChanges = true;
        this.saving = true;

        let isNew = this.active.length == 0;

        if(isNew) {
          // this.articles = null;
        }
        
        await this.article.save();

        // Refresh the list
        // TODO: only refresh when adding. We do this for now so that titles and icons will update correctly.
        await this.reloadArticles(true);

        this.active = [ this.article.id ];

        if(isNew) {
          // Allow editing since we just created a new article
          this.editing = true;
        }

        this.saving = false;
        this.unsaved = false;

        setTimeout(() => {
          this.ignoreChanges = false;
        }, 1);
      },
      async deleteArticle() {
        this.deleting.loading = true;
        
        await this.article.delete({ retainChildren: !this.deleting.children });

        // Refresh the list
        await this.reloadArticles(true);

        this.deleting.dialog = false;

        this.newArticle();
      }
    },
    mounted() {
      if(!this.$route.params.type) {
        this.$router.replace({ name: 'Codex', params: Object.assign(this.$route.params, { type: 'other' }) });
      }
      
      this.type = this.$route.params.type;
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