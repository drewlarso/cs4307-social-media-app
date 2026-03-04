const Navbar = {
    emits: ['tab-change', 'logout'],
    props: ['username'],
    data() {
        return {
            activeTab: 'discover',
        }
    },
    methods: {
        setTab(tab) {
            this.activeTab = tab
            this.$emit('tab-change', tab)
        },
    },
    template: `
        <nav class="sticky top-0 z-50 border-b border-[var(--color-border-dark)] bg-[var(--color-surface-dark)]">
            <div class="max-w-6xl mx-auto flex items-center px-6 py-4">

                <div class="flex-1 flex justify-start">
                    <h1 class="text-xl font-bold text-[var(--color-primary)] whitespace-nowrap">
                        Social Media
                    </h1>
                </div>

                <div class="flex flex-none gap-4">
                    <button
                        v-for="tab in ['home', 'discover', 'profile']"
                        :key="tab"
                        @click="setTab(tab)"
                        class="px-5 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                        :class="activeTab === tab
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-primary-light)]'"
                    >
                        {{ tab.charAt(0).toUpperCase() + tab.slice(1) }}
                    </button>
                </div>

                <div class="flex-1 flex justify-end items-center gap-3">
                    <template v-if="username">
                        <span class="text-[var(--color-text-muted)]">@{{ username }}</span>
                        <button
                            @click="$emit('logout')"
                            class="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-border-dark)] text-[var(--color-text-muted)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
                        >
                            Logout
                        </button>
                    </template>
                </div>

            </div>
        </nav>
    `,
}
