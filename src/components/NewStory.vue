<template>
    <v-card v-if="!!story">
        <v-text-field
            label="Story Title"
            v-model="story.title"
            filled
            hide-details />

        <v-card-text class="pt-4 pb-0">
            <v-textarea
                label="Description"
                v-model="story.description"
                outlined />
        </v-card-text>
        <v-card-actions>
            <v-spacer />
            <v-btn
                color="success"
                text
                :loading="loading"
                :disabled="story.title.length == 0"
                @click="create">
                Create Story
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        data: () => ({
            loading: false,

            story: null
        }),
        methods: {
            async create() {
                if(this.loading) return;

                this.loading = true;

                await this.story.save();

                this.loading = false;

                this.$emit('created', this.story);
            }
        },
        mounted() {
            this.story = new (this.$lb.Story)();
        }
    }
</script>