<template>
    <div v-if="!!entry">
        <v-card-title>
            <v-text-field
                class="display-1"
                placeholder="Title"
                v-model="entry.name"
                single-line
                full-width
                :readonly="saving || !editing"
                hide-details />
        </v-card-title>

        <editor
            ref="editor"
            class="pa-4"
            v-model="entry"
            :readonly="saving || !editing"
            :allow-mentions="allowMentions"
            @mention="$emit('mention')"
            min-height="350" />

        <v-snackbar
            v-model="unsaved"
            bottom
            :timeout="0">
            You have unsaved changes!
            <v-btn
                    dark text color="primary"
                    :loading="saving"
                    @click="doSave">
                Save
            </v-btn>
        </v-snackbar>
        
        <confirm-delete
                v-if="!!entry"
                :name="entry.name"
                v-model="deleting.dialog"
                @delete="doDelete">
            <template v-slot:extra>
                <v-checkbox
                    label="Delete Children"
                    v-model="deleting.children" />
            </template>
        </confirm-delete>
    </div>
</template>

<script>
    import Editor from './Editor.vue';
    import ConfirmDelete from './ConfirmDelete.vue';

    export default {
        components: { Editor, ConfirmDelete },
        props: ['loading', 'name', 'value', 'editing', 'allowMentions'],
        data: () => ({
            entry: null,

            saving: false,
            deleting: {
                dialog: false,
                children: false
            },

            unsaved: false,
            ignoreChanges: false
        }),
        watch: {
            value(val) {
                if(!val) {
                    this.entry = null;
                    return;
                }

                this.ignoreChanges = true;
                
                this.unsaved = false;

                this.entry = val;

                this.$nextTick(() => {
                    this.ignoreChanges = false;
                });
            },

            entry: {
                deep: true,
                handler(val, oldVal) {
                    if(this.ignoreChanges || !val || !oldVal) return;

                    this.unsaved = val.id == oldVal.id;
                }
            }
        },

        methods: {
            async doSave() {
                this.ignoreChanges = true;
                
                this.saving = true;

                this.$emit('input', this.entry);

                this.$emit('save', {
                    cb: () => {
                        this.saving = false;
                        this.unsaved = false;

                        this.$nextTick(() => {
                            this.ignoreChanges = false;
                        });
                    }
                });
            },
            async doDelete() {
                this.ignoreChanges = true;
                
                this.$emit('delete', {
                    retainChildren: !this.deleting.children,
                    cb: () => {
                        this.deleting.dialog = false;

                        this.$nextTick(() => {
                            this.ignoreChanges = false;
                        });
                    }
                });
            }
        },

        mounted() {
            this.entry = this.value.copy();
        }
    }
</script>