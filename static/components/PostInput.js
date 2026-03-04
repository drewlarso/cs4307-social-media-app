const PostInput = {
    props: ['username', 'modelValue'],
    emits: ['update:modelValue', 'submit'],
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
            this.$emit('submit')
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
                    <div class="flex justify-end mt-2">
                        <button
                            @click="handleSubmit"
                            :disabled="!content.trim()"
                            class="px-4 py-2 rounded-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border-dark)] disabled:cursor-not-allowed text-white font-medium transition-all duration-200"
                        >
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `,
}
