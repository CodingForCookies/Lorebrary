<template>
    <div>
        <v-dialog
                :value="visible"
                @input="$emit('update:visible', $event)"
                width="800">
            <v-card :loading="!items">
                <v-text-field
                    v-model="filter.name"
                    label="Search"
                    class="blue-grey darken-2"
                    dark
                    full-width
                    hide-details />

                <v-row no-gutters>
                    <v-col cols="12" md="3" class="blue-grey darken-3">
                        <v-list v-if="tags"
                                dense dark style="min-height:100%">
                            <v-list-item @click="filter.tags = ''">
                                All
                            </v-list-item>
                            <v-divider />
                            <v-list-item v-for="(tag, i) in tags" :key="i"
                                    @click="filter.tags = tag">
                                {{ tag }}
                            </v-list-item>
                        </v-list>
                    </v-col>
                    <v-col cols="12" md="9">
                        <v-card-text v-if="!items"
                                class="text-center py-4">
                            <v-progress-circular
                                :size="32"
                                :width="2"
                                color="primary"
                                indeterminate />
                        </v-card-text>
                        <scroll-area v-else style="max-height: 300px">
                            <v-card-text>
                                <v-row class="px-2">
                                    <v-col v-for="(resource, i) in filteredItems" :key="i"
                                        :class="'pa-2 resource-item ' + (selected == resource.id ? 'selected' : '')"
                                        style="position:relative"
                                        cols="3"
                                        @click="selected = (selected != resource.id ? resource.id : null)">
                                        <v-img
                                            :src="resource.src"
                                            aspect-ratio="1"/>
                                        <div class="text-center">
                                            {{ resource.name }}
                                        </div>

                                        <v-btn
                                            absolute top right
                                            small icon
                                            @click="editing.resource = resource.copy(); editing.isNew = false; editing.show = true">
                                            <v-icon small>fas fa-pencil-alt</v-icon>
                                        </v-btn>
                                    </v-col>
                                </v-row>
                            </v-card-text>
                        </scroll-area>
                    </v-col>
                </v-row>
                
                <v-divider />
                
                <v-card-actions class="grey lighten-3">
                    <v-btn
                        v-if="items"
                        text
                        @click="editing.resource = new ($lb.Resource)({ type: 'image' }); editing.isNew = true; editing.show = true">
                        Add Image
                    </v-btn>
                    <v-spacer />
                    <v-btn v-if="selection !== undefined && selection !== false"
                        color="success"
                        text
                        :loading="!items"
                        :disabled="!items"
                        @click="$emit('input', selected); $emit('update:visible', false)">
                        Select
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>

        <v-dialog
            v-model="editing.show"
            :persistent="editing.loading"
            width="500">
            <v-card v-if="editing.show">
                <v-text-field
                    label="Name"
                    filled
                    v-model="editing.resource.name" />

                <v-card-text>
                    <v-combobox
                        label="Tags"
                        v-model="editing.resource.tags"
                        append-icon=""
                        chips
                        multiple
                        clearable
                        @click.stop="" />

                    <v-text-field
                        label="URL"
                        v-model="editing.resource.src" />
                        
                    <!--<v-file-input
                        v-if="$store.dispatch('hasCapability', 'image.blob')"
                        label="Upload"
                        accept="image/*"
                        show-size />-->
                </v-card-text>
                
                <v-divider />
                
                <v-card-actions class="grey lighten-3">
                    <v-spacer />
                    <v-btn
                        color="success"
                        text
                        :loading="editing.loading"
                        :disabled="!editing.resource.name"
                        @click="saveEditing">
                        {{ editing.isNew ? 'Add' : 'Save' }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
    export default {
        props: ['visible', 'value', 'selection'],
        data: () => ({
            filter: {
                name: '',
                tags: ''
            },

            selected: null,
            editing: {
                show: false,
                loading: false,
                isNew: false,
                edit: null
            },

            items: null
        }),
        computed: {
            tags() {
                if(!this.items) return null;
                let tags = [];
                for(let item of Object.values(this.items)) {
                    if(!item.tags) continue;
                    item.tags.forEach(v => !tags.includes(v) ? tags.push(v) : undefined);
                }
                return tags;
            }, filteredItems() {
                if(!this.items) return [];
                let name = this.filter.name.toLowerCase();
                let tags = this.filter.tags.toLowerCase();
                return Object.values(this.items).filter(item => (!this.filter.tags || item.tags.some(v => v.includes(tags)))
                                                    && item.name.toLowerCase().includes(name));
            }
        },
        watch: {
            value(val) {
                this.selected = val;
            }
        },
        methods: {
            async saveEditing() {
                this.editing.loading = true;

                await this.editing.resource.save();

                this.$set(this.items, this.editing.resource.id, this.editing.resource);

                this.editing.loading = false;
                this.editing.show = false;
            }
        },
        async mounted() {
            this.selected = this.value;

            let resources = { };
            
            for(let resource of await this.$lb.Resource.find({ type: 'image' })) {
                console.log(resource);
                resources[resource.id] = resource;
            }

            this.items = resources;
        }
    }
</script>

<style>
    .resource-item {
        border: 1px solid transparent;
        border-radius: 5px;
    }

    .resource-item .v-image {
        box-shadow: 0 0 5px #999;
    }

    .resource-item .v-btn {
        top: 8px;
        right: 8px;

        display: none;
    }
    
    .resource-item:hover .v-btn {
        display: inherit;
    }

    .resource-item:hover {
        background-color: rgba(0, 0, 0, .05);
    }

    .resource-item.selected {
        border: 1px solid rgba(0, 0, 0, .05);
        background-color: rgba(0, 0, 0, .07);
    }
</style>