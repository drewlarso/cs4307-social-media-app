const PostModal = {
    template: `
        <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="close">
            <div class="bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)] max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="p-6 border-b border-[var(--color-border-dark)]">
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold">
                                {{ post?.username?.charAt(0).toUpperCase() || '?' }}
                            </div>
                            <div>
                                <h3 class="text-white font-medium">@{{ post?.username }}</h3>
                                <p class="text-xs text-[var(--color-text-muted)]">{{ formatDate(post?.created_at) }}</p>
                            </div>
                        </div>
                        <button @click="close" class="text-[var(--color-text-muted)] hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h2 class="text-xl font-bold text-white mb-2">{{ post?.title }}</h2>
                    <p class="text-[var(--color-text-muted)] whitespace-pre-wrap">{{ post?.content }}</p>
                </div>
                
                <div class="p-6">
                    <h4 class="text-white font-medium mb-4">Replies ({{ replies.length }})</h4>
                    
                    <div class="flex gap-3 mb-6">
                        <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {{ currentUsername?.charAt(0).toUpperCase() || '?' }}
                        </div>
                        <div class="flex-1">
                            <textarea
                                v-model="newReply"
                                placeholder="Write a reply..."
                                class="w-full p-3 rounded-lg bg-[var(--color-surface-dark)] border border-[var(--color-border-dark)] text-white placeholder-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                                rows="2"
                            ></textarea>
                            <button 
                                @click="submitReply"
                                :disabled="!newReply.trim()"
                                class="mt-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Reply
                            </button>
                        </div>
                    </div>
                    
                    <div v-if="replies.length === 0" class="text-center py-4">
                        <p class="text-[var(--color-text-muted)]">No replies yet</p>
                    </div>
                    <div v-else class="space-y-4">
                        <div v-for="reply in replies" :key="reply.reply_id" class="flex gap-3">
                            <div class="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {{ reply.username?.charAt(0).toUpperCase() || '?' }}
                            </div>
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-1">
                                    <span class="text-white font-medium text-sm">@{{ reply.username }}</span>
                                    <span class="text-xs text-[var(--color-text-muted)]">{{ formatDate(reply.created_at) }}</span>
                                </div>
                                <p class="text-[var(--color-text-muted)] text-sm">{{ reply.content }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    props: {
        show: Boolean,
        post: Object,
        replies: Array,
        currentUsername: String,
        currentAccountId: Number
    },
    data() {
        return {
            newReply: ''
        }
    },
    methods: {
        close() {
            this.$emit('close')
            this.newReply = ''
        },
        formatDate(dateString) {
            if (!dateString) return ''
            const date = new Date(dateString)
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
        },
        async submitReply() {
            if (!this.newReply.trim()) return
            
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            try {
                await API.createReply(
                    this.currentAccountId,
                    this.post.post_id,
                    this.newReply.trim(),
                    now
                )
                this.newReply = ''
                this.$emit('reply-submitted')
            } catch (error) {
                console.error('Failed to create reply:', error)
            }
        }
    }
}
