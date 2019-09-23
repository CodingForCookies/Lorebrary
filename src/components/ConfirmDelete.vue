<template>
    <v-dialog
            v-model="shown"
            :persistent="loading"
            width="500">
        <v-card>
            <v-card-title
                    class="headline"
                    primary-title>
                Delete '{{ name }}'?
            </v-card-title>

            <v-card-text class="pt-3 pb-0">
                This action cannot be undone!
            </v-card-text>

            <v-card-actions class="px-6">
                <slot name="extra" />

                <v-spacer />

                <v-btn
                        color="error"
                        text small
                        :loading="loading"
                        @click="$emit('delete')">
                    I'm sure
                </v-btn>

                <v-btn
                        color="primary"
                        depressed
                        :disabled="loading"
                        @click="shown = false">
                    No, please!
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
    export default {
        props: ['value', 'name'],
        data: () => ({
            shown: false,

            loading: false
        }),
        watch: {
            value(val) {
                this.shown = val;

                if(val) {
                    this.loading = false;
                }
            },

            shown(val) {
                this.$emit('input', val);
            }
        }
    }
</script>