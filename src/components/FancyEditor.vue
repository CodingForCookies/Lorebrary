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
        
        <v-dialog
                v-if="entry"
                v-model="deleting.dialog"
                :persistent="deleting.loading"
                width="500">
            <v-card>
                <v-card-title
                        class="headline"
                        primary-title>
                    Delete '{{ entry.name }}'?
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
                            :loading="deleting.loading"
                            @click="doDelete">
                        I'm sure
                    </v-btn>

                    <v-btn
                            color="primary"
                            depressed
                            :disabled="deleting.loading"
                            @click="deleting.dialog = false">
                        No, please!
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    import Editor from './Editor.vue'

    export default {
        components: { Editor },
        props: ['loading', 'name', 'value', 'editing', 'allowMentions'],
        data: () => ({
            entry: null,

            saving: false,
            deleting: {
                dialog: false,
                loading: false,
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
                    console.log(val);
                    if(this.ignoreChanges || !val || !oldVal) return;

                    this.unsaved = val.id == oldVal.id;
                }
            },

            'deleting.dialog'(val) {
                if(val) {
                    this.deleting.loading = false;
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
                
                this.deleting.loading = true;
                
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