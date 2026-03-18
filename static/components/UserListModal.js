const UserListModal = {
    props: ['show', 'title', 'users', 'currentUserId', 'showUnblock'],
    emits: ['close', 'view-profile', 'unblock'],
    methods: {
        handleUserClick(user) {
            this.$emit('view-profile', user)
            this.$emit('close')
        },
        handleUnblock(user) {
            this.$emit('unblock', user)
        }
    },
    template: `
        <div
            v-if="show"
            class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            @click.self="$emit('close')"
        >
            <div
                class="rounded-xl p-6 w-full max-w-md mx-4"
                style="background-color: var(--color-surface-dark); border: 1px solid var(--color-border-dark);"
            >
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-xl font-bold text-white">{{ title }}</h2>
                    <button
                        @click="$emit('close')"
                        class="text-[var(--color-text-muted)] hover:text-white transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="space-y-2 max-h-96 overflow-y-auto">
                    <div
                        v-for="user in users"
                        :key="user.account_id"
                        class="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-bg-dark)] transition-colors"
                        :class="showUnblock ? '' : 'cursor-pointer'"
                        @click="!showUnblock && handleUserClick(user)"
                    >
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm"
                            >
                                {{ user.username.charAt(0).toUpperCase() }}
                            </div>
                            <span class="text-white font-medium">@{{ user.username }}</span>
                        </div>
                        <button
                            v-if="showUnblock"
                            @click.stop="handleUnblock(user)"
                            class="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-border-dark)] text-[var(--color-text-muted)] hover:bg-red-600 hover:text-white transition-colors"
                        >
                            Unblock
                        </button>
                    </div>
                    <div v-if="users.length === 0" class="text-center text-[var(--color-text-muted)] py-8">
                        No users to show
                    </div>
                </div>
            </div>
        </div>
    `
}
