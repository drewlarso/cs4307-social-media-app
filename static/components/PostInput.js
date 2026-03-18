const PostInput = {
    props: ['username', 'modelValue'],
    emits: ['update:modelValue', 'update:topicId', 'submit'],
    data() {
        return {
            topics: [],
            selectedTopicId: null
        }
    },
    computed: {
        content: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value)
            }
        }
    },
    methods: {
        handleSubmit() {
            this.$emit('submit', this.selectedTopicId)
        },
        async fetchTopics() {
            try {
                this.topics = await API.fetchTopics()
                // Select first topic by default if available
                if (this.topics.length > 0 && !this.selectedTopicId) {
                    this.selectedTopicId = this.topics[0].topic_id
                }
            } catch (error) {
                console.error('Failed to fetch topics:', error)
            }
        }
    },
    template: `
        <div class="rounded-xl border border-[var(--color-border-dark)] p-4 mb-6" style="background-color: var(--color-surface-dark);">
            <div class="flex gap-3">
                <div class="w-10 h-10 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold flex-shrink-0">
                    {{ username ? username.charAt(0).toUpperCase() : '?' }}
                </div>
                <div class="flex-1">
                    <textarea
                        v-model="content"
                        placeholder="What's happening?"
                        class="w-full bg-transparent border-none outline-none resize-none text-white placeholder-[var(--color-text-muted)]"
                        rows="3"
                    ></textarea>
                    <div class="flex justify-between items-center mt-2">
                        <select
                            v-model="selectedTopicId"
                            class="bg-[var(--color-bg-dark)] border border-[var(--color-border-dark)] rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
                        >
                            <option v-for="topic in topics" :key="topic.topic_id" :value="topic.topic_id">
                                {{ topic.topic_name }}
                            </option>
                        </select>
                        <button
                            @click="handleSubmit"
                            :disabled="!content.trim() || !selectedTopicId"
                            class="px-4 py-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border-dark)] disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
    mounted() {
        this.fetchTopics()
    }
}
