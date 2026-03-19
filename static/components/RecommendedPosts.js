const RecommendedPosts = {
    template: `
        <div class="bg-[var(--color-surface-dark)] rounded-xl border border-[var(--color-border-dark)] p-4">
            <h3 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-[var(--color-primary)]" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Recommended Posts
            </h3>
            
            <div v-if="loading" class="flex justify-center py-4">
                <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--color-primary)]"></div>
            </div>
            
            <div v-else-if="posts.length === 0" class="text-center py-4">
                <p class="text-[var(--color-text-muted)] text-sm">No recommendations yet</p>
                <p class="text-xs text-[var(--color-text-muted)] mt-1">Follow more accounts to get personalized recommendations</p>
            </div>
            
            <div v-else class="space-y-3">
                <div v-for="post in posts" :key="post.post_id" 
                     class="p-3 rounded-lg border border-[var(--color-border-dark)] hover:border-[var(--color-primary)] transition-colors cursor-pointer"
                     @click="viewPost(post)">
                    <div class="flex items-center gap-2 mb-2">
                        <div class="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-xs">
                            {{ post.username?.charAt(0).toUpperCase() || '?' }}
                        </div>
                        <span class="text-sm text-white font-medium">@{{ post.username }}</span>
                    </div>
                    <h4 class="text-white font-medium text-sm mb-1">{{ post.title }}</h4>
                    <p class="text-[var(--color-text-muted)] text-xs line-clamp-2">{{ post.content }}</p>
                    <div class="flex items-center gap-3 mt-2">
                        <span class="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            {{ post.like_count || 0 }} likes
                        </span>
                        <span class="text-xs text-[var(--color-primary)] font-medium">
                            +{{ post.recommendation_score }} score
                        </span>
                    </div>
                </div>
            </div>
            
            <button v-if="posts.length > 0" 
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
        }
    },
    data() {
        return {
            posts: [],
            loading: true
        }
    },
    methods: {
        async fetchRecommendations() {
            this.loading = true
            try {
                this.posts = await API.fetchRecommendedPosts(this.accountId)
            } catch (error) {
                console.error('Failed to fetch recommended posts:', error)
            } finally {
                this.loading = false
            }
        },
        viewPost(post) {
            // Emit event to show post details or navigate
            this.$emit('view-post', post)
        },
        viewAll() {
            this.$emit('view-all-posts')
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
