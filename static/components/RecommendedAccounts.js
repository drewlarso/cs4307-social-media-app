const RecommendedAccounts = {
    template: `
        <div class="bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)] p-4">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
                Recommended Accounts
            </h3>
            
            <div v-if="loading" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
            </div>
            
            <div v-else-if="accounts.length === 0" class="text-center py-4">
                <p class="text-[var(--color-text-muted)] text-sm">No account recommendations yet</p>
                <p class="text-xs text-[var(--color-text-muted)] mt-1">Follow more accounts to get personalized recommendations</p>
            </div>
            
            <div v-else class="space-y-3">
                <div v-for="account in accounts" :key="account.account_id" 
                     class="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-border-dark)] transition-colors">
                    <div class="flex items-center gap-3 cursor-pointer" @click="viewProfile(account)">
                        <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                            {{ account.username?.charAt(0).toUpperCase() || '?' }}
                        </div>
                        <div>
                            <p class="text-white font-medium text-sm">@{{ account.username }}</p>
                            <p class="text-xs text-[var(--color-text-muted)]">{{ account.like_count }} likes from accounts you follow</p>
                        </div>
                    </div>
                    <button 
                        @click="followAccount(account)"
                        class="px-3 py-1 text-xs rounded-lg font-medium transition-colors"
                        :class="account.isFollowing ? 'bg-[var(--color-border-dark)] text-white hover:bg-red-600' : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'"
                    >
                        {{ account.isFollowing ? 'Following' : 'Follow' }}
                    </button>
                </div>
            </div>
            
            <button v-if="accounts.length > 0" 
                    @click="viewAll" 
                    class="w-full mt-3 text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] transition-colors">
                View All Recommendations →
            </button>
        </div>
    `,
    props: {
        accountId: {
            type: Number,
            required: true
        },
        currentUsername: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            accounts: [],
            loading: true
        }
    },
    methods: {
        async fetchRecommendations() {
            this.loading = true
            try {
                const recommended = await API.fetchRecommendedAccounts(this.accountId)
                
                // Check following status for each account
                for (const account of recommended) {
                    account.isFollowing = await API.isFollowing(this.accountId, account.account_id)
                }
                
                this.accounts = recommended
            } catch (error) {
                console.error('Failed to fetch recommended accounts:', error)
            } finally {
                this.loading = false
            }
        },
        async followAccount(account) {
            if (account.isFollowing) {
                // Unfollow
                await fetch('/follows', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_id: this.accountId,
                        to_id: account.account_id
                    })
                })
                account.isFollowing = false
            } else {
                // Follow
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
                await API.createFollow(this.accountId, account.account_id, now)
                account.isFollowing = true
            }
        },
        viewProfile(account) {
            this.$emit('view-profile', account)
        },
        viewAll() {
            this.$emit('view-all-accounts')
        }
    },
    mounted() {
        this.fetchRecommendations()
    },
    watch: {
        accountId: {
            handler() {
                this.fetchRecommendations()
            },
            immediate: true
        }
    }
}
