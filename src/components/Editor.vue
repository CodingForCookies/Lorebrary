<template>
  <div class="editor">
    <editor-menu-bubble
      v-if="isEditable"
      :editor="editor"
      :keep-in-bounds="keepInBounds"
      @hide="hideLinkMenu"
      v-slot="{ commands, isActive, getMarkAttrs, menu }">
      <div
        class="menububble"
        :class="{ 'is-active': menu.isActive }"
        :style="`left: ${menu.left}px; bottom: ${menu.bottom}px;`">
        <form class="menububble__form" v-if="linkMenuIsActive" @submit.prevent="setLinkUrl(commands.link, linkUrl)">
          <input class="menububble__input" type="text" v-model="linkUrl" placeholder="https://" ref="linkInput" @keydown.esc="hideLinkMenu"/>
          <button class="menububble__button" @click="setLinkUrl(commands.link, null)" type="button">
            <v-icon>fas fa-times-circle</v-icon>
          </button>
        </form>
        <template v-else>
          <div>
            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.heading({ level: 1 }) }"
              @click="commands.heading({ level: 1 })">
              H1
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.heading({ level: 2 }) }"
              @click="commands.heading({ level: 2 })">
              H2
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.heading({ level: 3 }) }"
              @click="commands.heading({ level: 3 })">
              H3
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.bold() }"
              @click="commands.bold">
              <v-icon>fas fa-bold</v-icon>
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.italic() }"
              @click="commands.italic">
              <v-icon>fas fa-italic</v-icon>
            </button>
          </div>

          <div>
            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.bullet_list() }"
              @click="commands.bullet_list">
              <v-icon>fas fa-list-ul</v-icon>
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.ordered_list() }"
              @click="commands.ordered_list">
              <v-icon>fas fa-list-ol</v-icon>
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.blockquote() }"
              @click="commands.blockquote">
              <v-icon>fas fa-quote-left</v-icon>
            </button>

            <button
              class="menububble__button"
              :class="{ 'is-active': isActive.code() }"
              @click="commands.code">
              <v-icon>fas fa-code</v-icon>
            </button>
          </div>
          <div>
            <button
              class="menububble__button"
              @click="showLinkMenu(getMarkAttrs('link'))"
              :class="{ 'is-active': isActive.link() }">
              <span>{{ isActive.link() ? 'Update Link' : 'Add Link'}}</span>
              <v-icon>fas fa-link</v-icon>
            </button>
          </div>
        </template>
      </div>
    </editor-menu-bubble>

    <editor-content ref="input" class="editor__content" :editor="editor" />
    
    <div class="suggestion-list" v-show="showSuggestions" ref="suggestions">
      <template v-if="hasResults">
        <div
          v-for="(item, index) in suggestions.items"
          :key="item.id"
          class="suggestion-list__item"
          :class="{ 'is-selected': suggestions.navigatedIndex === index }"
          @click="selectItem(item)"
        >
          {{ item.name }}
        </div>
      </template>
      <div v-else class="suggestion-list__item is-empty">
        No suggestions
      </div>
    </div>
  </div>
</template>

<script>
  import { Editor, EditorContent, EditorMenuBubble } from 'tiptap';
  import {
    Blockquote,
    BulletList,
    CodeBlock,
    HardBreak,
    Heading,
    ListItem,
    OrderedList,
    Bold,
    Code,
    Italic,
    Link,
    Strike,
    Underline,

    History,
    TrailingNode,

    Mention
  } from 'tiptap-extensions';

  // import Mention from '../plugins/tiptap-mention';
  
  import tippy from 'tippy.js';

  export default {
    components: {
      EditorMenuBubble,
      EditorContent,
    },
    props: ['readonly', 'value'],
    data() {
      return {
        ignoreUpdate: false,

        keepInBounds: false,
        
        linkUrl: null,
        linkMenuIsActive: false,

        editor: new Editor({
          extensions: [
            new Blockquote(),
            new BulletList(),
            new CodeBlock(),
            new HardBreak(),
            new Heading({ levels: [1, 2, 3] }),
            new ListItem(),
            new OrderedList(),
            new Link(),
            new Bold(),
            new Code(),
            new Italic(),
            new Strike(),
            new Underline(),

            new History(),
            new TrailingNode({
              node: 'paragraph',
              notAfter: ['paragraph'],
            }),

            new Mention({
              // is called when a suggestion starts
              onEnter: ({ items, query, range, command, virtualNode, }) => {
                this.suggestions.virtualNode = virtualNode;

                this.suggestions.query = query;
                this.suggestions.range = range;

                // we save the command for inserting a selected mention
                // this allows us to call it inside of our custom popup
                // via keyboard navigation and on click
                this.suggestions.insertMention = command;
              },
              // is called when a suggestion has changed
              onChange: ({ items, query, range, virtualNode, }) => {
                this.suggestions.virtualNode = virtualNode;

                this.suggestions.query = query;
                this.suggestions.range = range;
              },
              // is called when a suggestion is cancelled
              onExit: () => {
                // reset all saved values
                this.suggestions.query = null;

                this.destroyPopup();
              },
              // is called on every keyDown event while a suggestion is active
              onKeyDown: ({ event }) => {
                // pressing up arrow
                if(event.keyCode === 38) {
                  this.suggestions.navigatedIndex = ((this.suggestions.navigatedIndex + this.suggestions.items.length) - 1) % this.suggestions.items.length
                  return true;
                }

                // pressing down arrow
                if(event.keyCode === 40) {
                  this.suggestions.navigatedIndex = (this.suggestions.navigatedIndex + 1) % this.suggestions.items.length;
                  return true;
                }

                // pressing enter
                if(event.keyCode === 13) {
                  const item = this.suggestions.items[this.suggestions.navigatedIndex];
                  if(item) {
                    this.selectItem(item)
                  }

                  return true;
                }

                return false;
              }
            })
          ],
          content: '',
          onUpdate: ({ getJSON }) => {
            this.ignoreUpdate = true;
            this.$nextTick(() => this.ignoreUpdate = false);

            const state = getJSON();
            //this.$emit('input', state);
            this.$emit('input', state.content);
          }
        }),
        
        suggestions: {
          popup: null,
          items: [],

          virtualNode: null,
          query: null,
          navigatedIndex: 0,
          range: null,
          insertMention: () => {},
          observer: null,
        }
      }
    },
    computed: {
      isEditable() {
        return this.readonly !== undefined ? !this.readonly : true;
      },

      hasResults() {
        return this.suggestions.items.length;
      },
      showSuggestions() {
        return this.suggestions.query || this.hasResults;
      },
    },
    watch: {
      isEditable(val) {
        this.editor.setOptions({
          editable: val
        });
      },
      value(val) {
        if(this.ignoreUpdate) return;

        // this.editor.setContent(val);
        this.editor.setContent({
          type: 'doc',
          content: val
        });
      },

      async 'suggestions.query'(val) {
        // Require at least 3 characters to search
        if(!val || val.length < 3) {
          this.destroyPopup();
          this.suggestions.navigatedIndex = null;
          return;
        }
        
        this.suggestions.navigatedIndex = 0;

        // If the popup is gone, ignore the result. :(
        if(this.suggestions.navigatedIndex == null) return;

        // If the query is not the same, bail.
        if(this.suggestions.query != val) return;

        let result = await this.$store.dispatch('getArticles', { search: val });

        // If the popup is gone, ignore the result. :(
        if(this.suggestions.navigatedIndex == null) return;

        this.suggestions.items = Object.values(result);

        // Update the popup
        this.renderPopup();
      }
    },
    methods: {
      showLinkMenu(attrs) {
        this.linkUrl = attrs.href
        this.linkMenuIsActive = true
        this.$nextTick(() => {
          this.$refs.linkInput.focus()
        })
      },
      hideLinkMenu() {
        this.linkUrl = null
        this.linkMenuIsActive = false
      },
      setLinkUrl(command, url) {
        command({ href: url })
        this.hideLinkMenu()
      },

      // we have to replace our suggestion text with a mention
      // so it's important to pass also the position of your suggestion text
      selectItem(item) {
        this.suggestions.insertMention({
          range: this.suggestions.range,
          attrs: {
            id: item.id,
            label: item.name,
          },
        })
        this.editor.focus()
      },
      // renders a popup with suggestions
      renderPopup() {
        if (this.suggestions.popup) {
          return
        }

        this.suggestions.popup = tippy(this.suggestions.virtualNode, {
          content: this.$refs.suggestions,
          trigger: 'mouseenter',
          interactive: true,
          theme: 'dark',
          placement: 'top-start',
          inertia: true,
          duration: [400, 200],
          showOnInit: true,
          arrow: true,
          arrowType: 'round',
        });

        // we have to update tippy whenever the DOM is updated
        if (MutationObserver) {
          this.suggestions.observer = new MutationObserver(() => {
            this.suggestions.popup.popperInstance.scheduleUpdate()
          });

          this.suggestions.observer.observe(this.$refs.suggestions, {
            childList: true,
            subtree: true,
            characterData: true,
          });
        }
      },
      destroyPopup() {
        if (this.suggestions.popup) {
          this.suggestions.popup.destroy()
          this.suggestions.popup = null
        }

        if (this.suggestions.observer) {
          this.suggestions.observer.disconnect()
        }
      },

      clickListener(e) {
        if(this.isEditable) return;

        e = e || window.event;
        let target = e.target || e.srcElement;

        // Since the mention plugin doesn't have a click event option, do it ourselves
        let mentionId = target.attributes['data-mention-id'];
        if(!mentionId) return;

        this.$emit('mention', mentionId.nodeValue);
      }
    },
    mounted() {
      this.editor.setContent({
        type: 'doc',
        content: this.value
      });

      this.editor.setOptions({
        editable: this.isEditable,
      });

      document.addEventListener('click', this.clickListener, false);
    },
    beforeDestroy() {
      this.editor.destroy()

      document.removeEventListener('click', this.clickListener);
    }
  };
</script>

<style>
  .editor, .editor__content {
    display: flex;
    flex-direction: column;
  }
  
  .editor, .editor__content, .editor__content .ProseMirror {
    flex: 1;
  }

  .menububble {
    position: absolute;
    display: flex;
    flex-direction: column;

    margin-bottom: .5rem;
    padding: .3rem;
    
    background: #000;
    border-radius: 5px;
    
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    
    -webkit-transition: opacity .2s,visibility .2s;
    transition: opacity .2s,visibility .2s;
    
    opacity: 0;
    visibility: hidden;
    z-index: 20;
  }
  
  .menububble.is-active {
    opacity: 1;
    visibility: visible;
  }

  .menububble > div {
    display: flex;
    flex-direction: row;
    width: 100%;
    margin: .1rem 0;
  }

  .menububble > div > * {
    flex: 1;
  }

  .menububble .menububble__button {
    margin: .2rem;
    padding: 0 .5rem;

    color: #AAA;
    word-break: normal;

    vertical-align: middle;
  }

  .menububble .menububble__button.is-active {
    color: #FFF;

    background-color: #222;
    border-radius: 5px;
  }

  .menububble .v-icon {
    font-size: 1rem;

    color: #AAA;
  }

  .menububble .menububble__button.is-active .v-icon {
    color: #FFF;
  }

  .menububble .menububble__form .menububble__input {
    color: #FFF;
    caret-color: currentColor;
  }

  .editor__content p:last-child {
    margin-bottom: 0;
  }
  
  .editor blockquote {
    border-left: 3px solid rgba(0, 0, 0,.1);
    color: rgba(0, 0, 0, .8);
    padding-left: .8rem;
    font-style: italic;
  }


  .mention {
    background: rgba(0, 0, 0, 0.1);
    color: rgba(0, 0, 0, 0.6);
    font-size: 0.8rem;
    font-weight: bold;
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    white-space: nowrap;

    cursor: pointer;
  }

  .mention-suggestion {
    color: rgba(0, 0, 0, 0.6);
  }

  .suggestion-list {
    padding: 0.2rem;
    border: 2px solid rgba(0, 0, 0, 0.1);
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .suggestion-list__no-results {
    padding: 0.2rem 0.5rem;
  }

  .suggestion-list__item {
    border-radius: 5px;
    padding: 0.2rem 0.5rem;
    margin-bottom: 0.2rem;
    cursor: pointer;
  }
  
  .suggestion-list__item:last-child {
    margin-bottom: 0;
  }

  .suggestion-list__item.is-selected,
  .suggestion-list__item:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  .suggestion-list__item.is-empty {
    opacity: 0.5;
  }

  .tippy-tooltip.dark-theme {
    background-color: #000;
    padding: 0;
    font-size: 1rem;
    text-align: inherit;
    color: #FFF;
    border-radius: 5px;
  }
  .tippy-tooltip.dark-theme .tippy-backdrop {
    display: none;
  }
  .tippy-tooltip.dark-theme .tippy-roundarrow {
    fill: #000;
  }
  .tippy-tooltip.dark-theme .tippy-popper[x-placement^=top],
  .tippy-tooltip.dark-theme .tippy-arrow {
    border-top-color: #000;
  }
  .tippy-tooltip.dark-theme .tippy-popper[x-placement^=bottom],
  .tippy-tooltip.dark-theme .tippy-arrow {
    border-bottom-color: #000;
  }
  .tippy-tooltip.dark-theme .tippy-popper[x-placement^=left],
  .tippy-tooltip.dark-theme .tippy-arrow {
    border-left-color: #000;
  }
  .tippy-tooltip.dark-theme .tippy-popper[x-placement^=right],
  .tippy-tooltip.dark-theme .tippy-arrow {
    border-right-color: #000;
  }
</style>