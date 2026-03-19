const PopularFollows = {
    template: `
        <div class="bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)] p-4">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05c-.51.51-.898 1.166-1.172 1.882-.29.757-.516 1.674-.657 2.71-.141 1.037-.15 2.162-.025 3.292.218 1.979.976 3.858 2.28 5.296.184.203.403.382.64.53.153.096.32.17.5.216.144.036.294.06.448.064 1.066.026 2.202-.34 3.313-.872 1.122-.536 2.145-1.331 2.986-2.28.913-1.03 1.69-2.28 2.304-3.593.616-1.323 1.06-2.76 1.33-4.222.276-1.487.37-3.01.248-4.424a8.43 8.43 0 00-.288-1.438 5.17 5.17 0 00-.624-1.361c-.253-.365-.551-.666-.881-.922zM10 18a8 8 0 100-16 8 8 0 000 16z" clip-rule="evenodd" />
                </svg>
                Most Engaging Follows
            </h3>
            
            <div v-if="loading" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
            </div>
            
            <div v-else-if="accounts.length === 0" class="text-center py-4">
                <p class="text-[var(--color-text-muted)] text-sm">No followed accounts yet</p>
                <p class="text-xs text-[var(--color-text-muted)] mt-1">Follow some accounts to see their engagement stats</p>
            </div>
            
            <div v-else class="space-y-3">
                <div v-for="account in accounts" :key="account.account_id" 
                     class="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-border-dark)] transition-colors cursor-pointer"
                     @click="viewProfile(account)">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                            {{ account.username?.charAt(0).toUpperCase() || '?' }}
                        </div>
                        <div>
                            <p class="text-white font-medium text-sm">@{{ account.username }}</p>
                            <div class="flex items-center gap-2 text-xs">
                                <span class="text-[var(--color-text-muted)]">Engagement:</span>
                                <span class="text-[var(--color-primary)] font-medium">
                                    {{ (account.engagement_ratio * 100).toFixed(1) }}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-xs text-[var(--color-text-muted)]">likes/post</div>
                        <div class="text-white font-medium">{{ account.engagement_ratio.toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            
            <div v-if="accounts.length > 0" class="mt-3 pt-2 border-t border-[var(--color-border-dark)]">
                <p class="text-xs text-[var(--color-text-muted)]">
                    <span class="text-[var(--color-primary)]">↑ Higher percentage</span> means more likes per post
                </p>
            </div>
        </div>
    `,
    props: {
        accountId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            accounts: [],
            loading: true
        }
    },
    methods: {
        async fetchPopularFollows() {
            this.loading = true
            try {
                this.accounts = await API.fetchPopularFollows(this.accountId)
            } catch (error) {
                console.error('Failed to fetch popular follows:', error)
            } finally {
                this.loading = false
            }
        },
        viewProfile(account) {
            this.$emit('view-profile', account)
        }
    },
    mounted() {
        this.fetchPopularFollows()
    },
    watch: {
        accountId: {
            handler() {
                this.fetchPopularFollows()
            },
            immediate: true
        }
    }
}
