<template>
  <sidebar-page
      :rightbar="true"
      :loading="!article">
    <template v-slot:sidebar>
      <v-row no-gutters>
        <v-col v-for="([icon, name, id], i) in types" :key="i">
          <v-btn text block tile :height="64"
              :to="{ name: 'Codex', params: { universeId: $route.params.universeId, type: id }}"
              exact>
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
    </template>

    <template v-slot:content>
      <fancy-editor
        ref="editor"
        class="pa-4"
        min-height="350"
        v-model="article"
        :editing="selected ? editing : true"
        allow-mentions
        @mention="loadArticle"
        @save="saveArticle"
        @delete="deleteArticle" />

      <v-btn v-if="selected"
          absolute
          top right
          min-width="60"
          min-height="60"
          dark depressed tile
          :ripple="false"
          @click="editing = !editing">
        <v-icon>fas fa-{{ editing ? 'eye' : 'pencil-alt' }}</v-icon>
      </v-btn>
    </template>
    
    <template v-slot:rightbar>
      <article-info
          :is-editing="!saving && editing"
          :article="article"
          :article-image="articleImage"
          @image="image.dialog = true"
          @mentions="mentions.dialog = true"
          @delete="$refs.editor.deleting.dialog = true" />
    </template>
    
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
  </sidebar-page>
</template>

<script>
  import SidebarPage from '../../components/SidebarPage.vue'
  import FancyEditor from '../../components/FancyEditor.vue'
  import ImageEditor from '../../components/ImageEditor.vue'
  
  import ArticleInfo from '../../components/ArticleInfo.vue'

  export default {
    components: { SidebarPage, FancyEditor, ImageEditor, ArticleInfo },
    data: () => ({
      search: {
        text: '',
        tags: []
      },

      types: [
        ['city', 'Places', 'places'],
        ['user', 'Beings', 'beings'],
        ['box', 'Things', 'things'],
        ['book', 'Codex', 'other']
      ],

      active: [],

      tree: [],
      open: [],

      articleMap: { },
      articles: null,

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
      }
    }),
    computed: {
      type() {
        return this.$route.params.type;
      },

      selected: {
        get() {
          return this.active.length > 0 ? this.active[0] : null;
        },
        set(val) {
          this.active = val ? [ val ] : [ ];
        }
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

      async 'article.image'(val) {
        this.articleImage = (val ? await this.$lb.Resource.get({ id: val }) : null);
      },

      async 'mentions.dialog'(val) {
        if(!val) return;

        this.mentions.articles = [];

        this.mentions.articles = await this.article.getMentionedIn();
      },

      async selected(val) {
        if(!val) {
          this.newArticle();
          return;
        }
      
        if(this.article && this.article.id == val) return;

        this.loadArticle(val);
      }
    },

    methods: {
      filterTree(item, filter) {
        filter = filter.toLowerCase();
        return item.name.toLowerCase().includes(filter) || item.tags.some(v => v.toLowerCase().indexOf(filter) !== -1);
      },

      async reloadArticles(inPlaceReload) {
        if(!inPlaceReload) {
          this.articles = null;
          this.article = null;
        }

        let articles = await this.$lb.Article.find(
          // 'Other' will show accidentially orphaned articles.
          !this.type ? {
            $or: [ { type: 'other' }, { type: null } ]
          } : { type: this.type }
        );

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
            if(!parent) {
              this.articles.push(article);
              continue;
            }

            if(!parent.children) parent.children = [];
            parent.children.push(article);
          }
        }
      },

      newArticle(parent) {
        this.article = new (this.$lb.Article)({ type: this.type, parent: parent ? parent.id : null });
        this.articleParent = parent;
        
        this.selected = null;
        
        this.$router.push({ name: 'Codex', params: Object.assign(this.$route.params, { article: null }) });
      },
      async loadArticle(id) {
        this.article = null;

        this.selected = id;

        this.articleParent = null;
        
        this.article = await this.$lb.Article.get({ id });

        if(this.article) {
          this.$router.push({ name: 'Codex', params: Object.assign(this.$route.params, { type: this.article.type, article: this.article.id }) });
        }else{
          this.newArticle();
        }
      },
      async saveArticle({ cb }) {
        await this.article.save();

        // Refresh the list
        // TODO: only refresh when adding. We do this for now so that titles and icons will update correctly.
        await this.reloadArticles(true);

        this.selected = this.article.id;
        
        this.$router.replace({ name: 'Codex', params: Object.assign(this.$route.params, { article: this.article.id }) });

        cb();
      },
      async deleteArticle({ retainChildren, cb }) {
        await this.article.delete(retainChildren);

        // Refresh the list
        await this.reloadArticles(true);

        this.newArticle();

        cb();
      }
    },
    async mounted() {
      await this.reloadArticles();
      
      // If an article is selected, go to it.
      if(this.$route.params.article) {
        await this.loadArticle(this.$route.params.article);
      }else
        // Otherwise, reset the article editor.
        this.newArticle();
    },
    beforeRouteUpdate (to, from, next) {
      if(to.params.type) {
        next();
      }else{
        next({ replace: true, name: 'Codex', params: Object.assign(to.params, { type: 'other' }) });
      }
    }
  }
</script>