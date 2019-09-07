<template>
    <div class="fill-height">
        <v-img v-if="article.image"
            :src="articleImage ? (articleImage.src || articleImage.blob) : undefined"
            aspect-ratio="1"
            class="grey lighten-2"
            @click="isEditing ? $emit('image') : undefined">
            <template v-slot:placeholder>
                <v-row
                    class="fill-height ma-0"
                    align="center"
                    justify="center">
                    <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
                </v-row>
            </template>
        </v-img>
        <div v-else-if="isEditing">
            <!-- Image editing -->
            <v-btn v-if="isEditing"
                block
                min-width="60"
                min-height="60"
                dark depressed tile
                :ripple="false"
                @click="$emit('image')">
                <v-icon class="mr-3">fas fa-image</v-icon>
                Image
            </v-btn>
        </div>

        <v-row class="mx-0 transparent-bg" no-gutters>
            <v-col v-for="[icon, name] in [['map', 'Map'], ['list', 'Mentions'], ['history', 'History']]" :key="icon"
                    cols="4">
                <v-btn text block tile :height="64">
                    <div>
                    <v-icon small>fas fa-{{ icon }}</v-icon>
                    <div class="mt-2 overline">{{ name }}</div>
                    </div>
                </v-btn>
            </v-col>
        </v-row>

        <v-card-text>
            <div class="mb-6">
            <div class="headline cinzel">Tags</div>
            <v-divider />
            <v-combobox
                v-model="article.tags"
                label="No tags added"
                append-icon=""
                full-width
                multiple
                chips
                hide-details
                :readonly="!isEditing">
                <template v-slot:selection="data">
                <v-chip
                    dark
                    v-bind="data.attrs"
                    :input-value="data.selected"
                    @click:close="data.parent.selectItem(data.item)">
                    {{ data.item }}
                </v-chip>
                </template>
            </v-combobox>
            </div>

            <v-fade-transition>
            <div class="mb-6" v-if="isEditing && article.id">
                <div class="headline cinzel">Actions</div>
                <v-divider class="mb-3" />
                <v-btn
                    depressed block color="error"
                    @click="$emit('delete')">Delete Article</v-btn>
            </div>
            </v-fade-transition>

            <!--<div class="mb-6">
            <div class="headline cinzel">Edited By</div>
            <v-chip dark class="ma-1">Stumblinbear</v-chip>
            </div>-->
        </v-card-text>
    </div>
</template>

<script>
    export default {
        props: ['article', 'articleImage', 'isEditing']
    }
</script>