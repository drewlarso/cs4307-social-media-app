const LoginPopup = {
    emits: ['login'],
    props: ['show'],
    data() {
        return {
            inputUsername: '',
        }
    },
    methods: {
        login() {
            if (this.inputUsername.trim()) {
                const username = this.inputUsername.trim()
                localStorage.setItem('username', username)
                this.inputUsername = ''
                this.$emit('login', username)
            }
        },
        logout() {
            localStorage.removeItem('username')
            this.inputUsername = ''
            this.$emit('login', '')
        },
    },
    template: `
        <div>
            <!-- Login Popup -->
            <div
                v-if="show"
                class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            >
                <div
                    class="rounded-xl p-6 w-full max-w-md mx-4"
                    style="background-color: var(--color-surface-dark); border: 1px solid var(--color-border-dark);"
                >
                    <h2 class="text-xl font-bold mb-4">Welcome!</h2>
                    <p class="text-[var(--color-text-muted)] mb-4">Enter your username to continue</p>
                    <input
                        v-model="inputUsername"
                        @keyup.enter="login"
                        type="text"
                        placeholder="Username"
                        class="w-full bg-transparent border border-[var(--color-border-dark)] rounded-lg p-3 focus:outline-none focus:border-[var(--color-primary)] mb-4"
                        autofocus
                    />
                    <button
                        @click="login"
                        class="w-full px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white rounded-lg font-medium transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    `,
}
