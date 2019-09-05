<template>
    <v-footer dark absolute padless class="app-footer">
        <v-col cols="12" class="pa-2 text-center">
            <a href="https://discord.gg/8bA24C9" target="_blank">
                <v-icon size="24px">fab fa-discord</v-icon>
            </a>
            <span class="px-1"></span>
            {{ new Date().getFullYear() }} — CodingForCookies
        </v-col>
    </v-footer>
</template>

<style scoped>
    .app-footer {
        background-color: #37474f;
        border-color: #263238;

        font-size: .75rem;
    }
</style>