const Post = {
    props: ['username', 'content', 'createdAt', 'title', 'postId', 'accountId', 'posterAccountId'],
    emits: ['like', 'reply', 'follow-user', 'block-user'],
    data() {
        return {
            likeCount: 0,
            hasLiked: false,
            replies: [],
            replyContent: '',
            isFollowing: false,
            isBlocked: false
        }
    },
    methods: {
        formatTime(dateString) {
            const date = new Date(dateString)
            const now = new Date()
            const diffMs = now - date
            const diffSecs = Math.floor(diffMs / 1000)
            const diffMins = Math.floor(diffMs / 60000)
            const diffHours = Math.floor(diffMs / 3600000)
            const diffDays = Math.floor(diffMs / 86400000)
            const diffWeeks = Math.floor(diffMs / 604800000)
            const diffMonths = Math.floor(diffMs / 2592000000)

            if (diffSecs < 5) return 'Just now'
            if (diffSecs < 60) return `${diffSecs}s ago`
            if (diffMins < 60) return `${diffMins}m ago`
            if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`
            if (diffDays < 7) return `${diffDays}d ${diffHours % 24}h ago`
            if (diffWeeks < 4) return `${diffWeeks}w ago`
            if (diffMonths < 12) return `${diffMonths}mo ago`
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        },
        getInitials() {
            const username = localStorage.getItem('username') || '?'
            return username.charAt(0).toUpperCase()
        },
        async toggleLike() {
            const accId = this.accountId || parseInt(localStorage.getItem('accountId'))
            if (!accId || !this.postId) {
                console.warn('No account ID or post ID available for liking')
                return
            }
            
            // Optimistic UI update - update immediately before API call
            const wasLiked = this.hasLiked
            this.hasLiked = !this.hasLiked
            this.likeCount = wasLiked ? Math.max(0, this.likeCount - 1) : this.likeCount + 1
            
            try {
                if (wasLiked) {
                    await API.deleteLike(accId, this.postId)
                } else {
                    await API.createLike(accId, this.postId, 1)
                }
                this.$emit('like', { postId: this.postId, liked: this.hasLiked })
            } catch (error) {
                console.error('Failed to toggle like:', error)
                // Revert on error
                this.hasLiked = wasLiked
                this.likeCount = wasLiked ? Math.max(0, this.likeCount + 1) : Math.max(0, this.likeCount - 1)
            }
        },
        async loadLikes() {
            if (!this.postId) return
            const accId = this.accountId || parseInt(localStorage.getItem('accountId'))
            try {
                this.likeCount = await API.fetchLikeCount(this.postId)
                if (accId) {
                    this.hasLiked = await API.hasUserLikedPost(accId, this.postId)
                }
            } catch (error) {
                console.error('Failed to load likes:', error)
            }
        },
        async loadReplies() {
            if (!this.postId) return
            try {
                this.replies = await API.fetchRepliesByPost(this.postId)
            } catch (error) {
                console.error('Failed to load replies:', error)
                this.replies = []
            }
        },
        toggleReplies() {
            // Scroll to replies section and load if needed
            if (this.replies.length === 0) {
                this.loadReplies()
            }
            // Scroll to the replies section smoothly
            this.$nextTick(() => {
                const repliesSection = this.$el.querySelector('.replies-section')
                if (repliesSection) {
                    repliesSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
            })
        },
        async submitReply() {
            const accId = this.accountId || parseInt(localStorage.getItem('accountId'))
            if (!this.replyContent.trim() || !accId || !this.postId) return

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            try {
                await API.createReply(accId, this.postId, this.replyContent.trim(), now)
                this.replyContent = ''
                await this.loadReplies()
                this.$emit('reply', { postId: this.postId })
            } catch (error) {
                console.error('Failed to create reply:', error)
            }
        },
        async toggleFollow() {
            const currentAccId = this.accountId || parseInt(localStorage.getItem('accountId'))
            if (!currentAccId || !this.posterAccountId) return

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            try {
                if (this.isFollowing) {
                    await fetch('/follows', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            from_id: currentAccId,
                            to_id: this.posterAccountId
                        })
                    })
                    this.isFollowing = false
                } else {
                    await API.createFollow(currentAccId, this.posterAccountId, now)
                    this.isFollowing = true
                }
                this.$emit('follow-user', { username: this.username, following: this.isFollowing })
            } catch (error) {
                console.error('Failed to toggle follow:', error)
            }
        },
        async toggleBlock() {
            const currentAccId = this.accountId || parseInt(localStorage.getItem('accountId'))
            if (!currentAccId || !this.posterAccountId) return

            try {
                if (this.isBlocked) {
                    await fetch('/blocks', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            from_id: currentAccId,
                            to_id: this.posterAccountId
                        })
                    })
                    this.isBlocked = false
                } else {
                    await API.createBlock(currentAccId, this.posterAccountId)
                    this.isBlocked = true
                    // Unfollow if following
                    if (this.isFollowing) {
                        this.isFollowing = false
                    }
                }
                this.$emit('block-user', { username: this.username, blocked: this.isBlocked })
            } catch (error) {
                console.error('Failed to toggle block:', error)
            }
        },
        async loadFollowBlockStatus() {
            const currentAccId = this.accountId || parseInt(localStorage.getItem('accountId'))
            if (!currentAccId || !this.posterAccountId || currentAccId === this.posterAccountId) return

            try {
                [this.isFollowing, this.isBlocked] = await Promise.all([
                    API.isFollowing(currentAccId, this.posterAccountId),
                    API.isBlocked(currentAccId, this.posterAccountId)
                ])
            } catch (error) {
                console.error('Failed to load follow/block status:', error)
            }
        },
    },
    watch: {
        accountId() {
            // Reload likes when accountId changes
            this.loadLikes()
        },
        postId() {
            // Reload likes and clear replies when post changes
            this.replies = []
            this.loadLikes()
            this.loadFollowBlockStatus()
        }
    },
    computed: {
        showUserActions() {
            const currentAccId = this.accountId || parseInt(localStorage.getItem('accountId'))
            // Show actions only if user is logged in and viewing someone else's post
            return currentAccId && this.posterAccountId && currentAccId !== this.posterAccountId
        }
    },
    template: `
        <div
            class="rounded-xl border border-[var(--color-border-dark)] transition-all duration-200 hover:border-[var(--color-primary)]"
            style="background-color: var(--color-surface-dark);"
        >
            <div class="p-6 flex items-start gap-4">
                <div
                    class="w-12 h-12 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                >
                    {{ username.charAt(0).toUpperCase() }}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="font-semibold text-white text-base">@{{ username }}</span>
                        <template v-if="showUserActions">
                            <button
                                @click="toggleFollow"
                                class="px-2 py-0.5 text-xs rounded font-medium transition-colors"
                                :class="isFollowing ? 'bg-[var(--color-border-dark)] text-white hover:bg-red-600' : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'"
                            >
                                {{ isFollowing ? 'Following' : 'Follow' }}
                            </button>
                            <button
                                @click="toggleBlock"
                                class="px-2 py-0.5 text-xs rounded font-medium transition-colors"
                                :class="isBlocked ? 'bg-[var(--color-border-dark)] text-white hover:bg-red-600' : 'bg-[var(--color-border-dark)] text-[var(--color-text-muted)] hover:bg-red-600 hover:text-white'"
                            >
                                {{ isBlocked ? 'Unblock' : 'Block' }}
                            </button>
                        </template>
                    </div>
                    <h3 v-if="title" class="font-bold text-white text-lg mb-2">{{ title }}</h3>
                    <p class="text-[var(--color-text)] whitespace-pre-wrap break-words leading-relaxed text-base">{{ content }}</p>
                    
                    <!-- Action Buttons -->
                    <div class="flex items-center gap-6 mt-4 pt-4 border-t border-[var(--color-border-dark)]">
                        <button
                            @click="toggleLike"
                            class="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                            :class="{ 'text-[var(--color-primary)]': hasLiked }"
                        >
                            <svg v-if="!hasLiked" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" />
                            </svg>
                            <span class="text-sm">{{ likeCount }}</span>
                        </button>
                        
                        <button
                            @click="toggleReplies"
                            class="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span class="text-sm">{{ replies.length }}</span>
                        </button>
                    </div>
                    
                    <!-- Replies Section -->
                    <div class="replies-section mt-4 pt-4 border-t border-[var(--color-border-dark)]">
                        <!-- Reply Input -->
                        <div class="flex gap-3 items-start mb-4">
                            <div
                                class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                            >
                                {{ getInitials() }}
                            </div>
                            <div class="flex-1">
                                <textarea
                                    v-model="replyContent"
                                    placeholder="Write a reply..."
                                    class="w-full bg-[var(--color-bg-dark)] border border-[var(--color-border-dark)] rounded-lg px-3 py-2 text-sm text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-none"
                                    rows="2"
                                ></textarea>
                                <div class="flex justify-end mt-2">
                                    <button
                                        @click="submitReply"
                                        :disabled="!replyContent.trim()"
                                        class="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border-dark)] disabled:cursor-not-allowed text-white font-medium transition-colors"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Existing Replies -->
                        <div v-if="replies.length > 0" class="space-y-3 pt-4 border-t border-[var(--color-border-dark)]">
                            <div
                                v-for="reply in replies"
                                :key="reply.reply_id"
                                class="flex gap-3 items-start"
                            >
                                <div
                                    class="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center text-[var(--color-primary)] font-bold text-sm flex-shrink-0"
                                >
                                    {{ reply.username.charAt(0).toUpperCase() }}
                                </div>
                                <div class="flex-1">
                                    <div class="flex items-center gap-2">
                                        <span class="font-semibold text-white text-sm">@{{ reply.username }}</span>
                                    </div>
                                    <p class="text-[var(--color-text-muted)] text-sm">{{ reply.content }}</p>
                                </div>
                            </div>
                        </div>
                        <div v-else class="text-center text-[var(--color-text-muted)] text-sm py-4">
                            No replies yet. Be the first to reply!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        this.loadLikes()
        this.loadReplies()
        this.loadFollowBlockStatus()
    },
}
