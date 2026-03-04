const Post = {
    props: ['username', 'content'],
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
                </div>
            </div>
        </div>
    `,
}
