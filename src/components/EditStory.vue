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
                @click="save">
                {{ !value ? 'Create Story' : 'Save' }}
            </v-btn>
        </v-card-actions>
    </v-card>
</template>

<script>
    export default {
        props: ['value'],
        data: () => ({
            loading: false,

            story: null
        }),
        methods: {
            async save() {
                if(this.loading) return;

                this.loading = true;

                await this.story.save();

                this.loading = false;

                this.$emit('input', this.story);
                this.$emit('saved', this.story);
            }
        },
        mounted() {
            if(!this.value)
                this.story = new (this.$lb.Story)();
            else{
                this.story = this.value.copy();
            }
        }
    }
</script>