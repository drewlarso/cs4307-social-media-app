const TopicCard = {
    emits: ['select'],
    props: ['topic', 'postCount'],
    methods: {
        handleClick() {
            this.$emit('select', this.topic)
        }
    },
    template: `
        <div
            @click="handleClick"
            class="rounded-xl border border-[var(--color-border-dark)] p-5 cursor-pointer transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
            style="background-color: var(--color-surface-dark);"
        >
            <h3 class="font-bold text-white text-lg mb-1">{{ topic.topic_name }}</h3>
            <p class="text-[var(--color-text-muted)] text-sm mb-3 line-clamp-2">{{ topic.description || 'No description' }}</p>
            <div class="flex items-center justify-between">
                <span class="text-xs text-[var(--color-text-muted)]">
                    {{ postCount || 0 }} post{{ postCount !== 1 ? 's' : '' }}
                </span>
                <span class="text-xs text-[var(--color-primary)]">View posts →</span>
            </div>
        </div>
    `,
}
