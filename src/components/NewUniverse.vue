<template>
    <v-card tile v-if="!!universe">
        <v-text-field
            label="Universe Name"
            v-model="universe.name"
            filled
            hide-details />

        <v-card-text class="pt-4 pb-0">
            <v-textarea
                label="Description"
                v-model="universe.description"
                outlined />

            <v-select
                label="Driver"
                :items="Object.values(this.$drivers)"
                item-value="id"
                item-text="name"
                v-model="universe.driver"
                :item-disabled="isDisabled"
                :append-icon="driver ? driver.icon : ''"
                outlined
                hide-details>
                <!--<template v-slot:prepend-item="data">
                <v-icon small>fas fa-{{ $drivers[data.item.driver].icon }}</v-icon>
                </template>-->
                <template v-slot:item="data">
                    <v-list-item-content>
                        <v-list-item-title>{{ data.item.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ data.item.info.description }}</v-list-item-subtitle>
                    </v-list-item-content>
                    <v-list-item-avatar>
                        <v-icon small>{{ data.item.icon }}</v-icon>
                    </v-list-item-avatar>
                </template>
            </v-select>

            <v-list dense v-if="universe.driver">
                <template v-for="[type, color, icon] in [['good', 'success', 'check'], ['bad', 'error', 'times']]">
                    <v-list-item v-for="(text, j) in driver.info[type]" :key="type + '-' + j">
                        <v-icon small :color="color" class="mr-3" style="width:32px">
                            fas fa-{{ icon }}
                        </v-icon>
                        <v-list-item-content :class="color + '--text'">
                            {{ text }}
                        </v-list-item-content>
                    </v-list-item>
                </template>
            </v-list>
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn
                color="success"
                text
                :loading="$store.state.universeLoading"
                :disabled="universe.name.length == 0 || universe.driver == null"
                @click="create">
                Create Universe
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        props: ['value'],
        data: () => ({
            universe: null
        }),
        watch: {
            value(val) {
                this.universe = val.copy();
            },
            'universe.driver'(val) {
                this.driver = this.$drivers[val];
            }
        },
        methods: {
            isDisabled(item) {
                return !item.isAccessible();
            },
            async create() {
                if(this.$store.state.universeLoading) return;

                this.$store.state.universeLoading = true;

                await this.universe.save();

                this.$set(this.$store.state.universes, this.universe.id, this.universe);

                this.$store.state.universeLoading = false;

                this.$emit('input', this.universe);
                this.$emit('created');
            }
        },
        mounted() {
            this.universe = this.value || new (this.$lb.Universe)();
        }
    }
</script>