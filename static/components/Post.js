const Post = {
    props: ['username', 'content', 'createdAt'],
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
                    </div>
                    <p class="text-[var(--color-text)] whitespace-pre-wrap break-words leading-relaxed text-base">{{ content }}</p>
                    <div class="mt-3 flex justify-end">
                        <span class="text-xs text-[var(--color-text-muted)]">{{ formatTime(createdAt) }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
}
