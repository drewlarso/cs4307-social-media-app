const LoginPopup = {
    emits: ['login'],
    props: ['show'],
    data() {
        return {
            inputUsername: '',
            inputName: '',
            step: 1, // 1 = username, 2 = name (for new users)
            isCreating: false,
            error: ''
        }
    },
    methods: {
        async login() {
            if (!this.inputUsername.trim()) return
            
            const username = this.inputUsername.trim()
            
            try {
                // Fetch all accounts and people to find matching username
                const [accounts, people] = await Promise.all([
                    fetch('/accounts?t=' + Date.now()).then(r => r.json()),
                    fetch('/people?t=' + Date.now()).then(r => r.json())
                ])
                
                // Find account with this username
                const existingAccount = accounts.find(acc => acc.username === username)
                
                if (existingAccount) {
                    // User exists, log them in
                    localStorage.setItem('username', username)
                    localStorage.setItem('accountId', existingAccount.account_id)
                    localStorage.setItem('personId', existingAccount.person_id)
                    this.inputUsername = ''
                    this.step = 1
                    this.$emit('login', username)
                } else {
                    // New user, go to step 2
                    this.step = 2
                }
            } catch (error) {
                console.error('Error checking account:', error)
                this.error = 'Failed to check account'
            }
        },
        
        async createAccount() {
            if (!this.inputName.trim()) return

            this.isCreating = true
            this.error = ''

            try {
                const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
                const username = this.inputUsername

                // Create person first
                const person = await API.createPerson(
                    `${username.toLowerCase()}@example.com`,
                    this.inputName,
                    '2000-01-01'
                )

                // Get the person_id from the last inserted row
                // SQLite doesn't return the ID directly, so we fetch it
                const people = await fetch('/people?t=' + Date.now()).then(r => r.json())
                const newPerson = people.find(p => p.email === `${username.toLowerCase()}@example.com`)

                // Create account
                await API.createAccount(
                    newPerson.person_id,
                    username,
                    now
                )

                // Get the newly created account
                const accounts = await fetch('/accounts?t=' + Date.now()).then(r => r.json())
                const newAccount = accounts.find(acc => acc.username === username)

                // Log them in
                localStorage.setItem('username', username)
                localStorage.setItem('accountId', newAccount.account_id)
                localStorage.setItem('personId', newPerson.person_id)

                this.inputUsername = ''
                this.inputName = ''
                this.step = 1
                this.$emit('login', username)
            } catch (error) {
                console.error('Error creating account:', error)
                this.error = 'Failed to create account'
            } finally {
                this.isCreating = false
            }
        },
        
        goBack() {
            this.step = 1
            this.inputName = ''
            this.error = ''
        }
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
                    <template v-if="step === 1">
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
                            :disabled="!inputUsername.trim()"
                            class="w-full px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border-dark)] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                        >
                            Continue
                        </button>
                    </template>
                    
                    <template v-else-if="step === 2">
                        <h2 class="text-xl font-bold mb-4">Create Account</h2>
                        <p class="text-[var(--color-text-muted)] mb-4">No account found for "{{ inputUsername }}". Let's create one!</p>
                        <input
                            v-model="inputName"
                            @keyup.enter="createAccount"
                            type="text"
                            placeholder="Your Name"
                            class="w-full bg-transparent border border-[var(--color-border-dark)] rounded-lg p-3 focus:outline-none focus:border-[var(--color-primary)] mb-4"
                            autofocus
                        />
                        <div class="flex gap-2">
                            <button
                                @click="goBack"
                                class="flex-1 px-4 py-2 bg-[var(--color-border-dark)] hover:bg-[var(--color-border-dark)] text-[var(--color-text-muted)] rounded-lg font-medium transition-colors"
                            >
                                Back
                            </button>
                            <button
                                @click="createAccount"
                                :disabled="!inputName.trim() || isCreating"
                                class="flex-1 px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] disabled:bg-[var(--color-border-dark)] disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                            >
                                {{ isCreating ? 'Creating...' : 'Create Account' }}
                            </button>
                        </div>
                        <p v-if="error" class="text-red-400 text-sm mt-3">{{ error }}</p>
                    </template>
                </div>
            </div>
        </div>
    `,
}
