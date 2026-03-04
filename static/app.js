const { createApp } = Vue

createApp({
    data() {
        return {
            currentTab: 'home',
            username: localStorage.getItem('username') || '',
            posts: [],
            discoverPosts: [],
            profilePosts: [],
            message: 'Welcome! Select a tab to get started.',
            newPostContent: ''
        }
    },
    computed: {
        showLoginPopup() {
            return !this.username
        },
    },
    methods: {
        async handleTabChange(tab) {
            this.currentTab = tab

            if (tab === 'home' && this.username) {
                this.posts = []
                await this.fetchUserPosts()
            } else if (tab === 'discover') {
                this.posts = []
                await this.fetchDiscoverPosts()
            } else if (tab === 'profile' && this.username) {
                this.profilePosts = []
                await this.fetchProfilePosts()
            }
        },
        async fetchUserPosts() {
            const targetTab = 'home'
            try {
                const response = await fetch(`/posts/${this.username}?t=${Date.now()}`)
                const data = await response.json()

                if (this.currentTab === targetTab) {
                    this.posts = data.map(post => ({
                        post_id: post.id,
                        username: post.display_name,
                        content: post.content,
                        created_at: post.created_at
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch user posts:', error)
                if (this.currentTab === targetTab) this.posts = []
            }
        },
        async fetchDiscoverPosts() {
            const targetTab = 'discover'
            try {
                const response = await fetch(`/posts?t=${Date.now()}`)
                const data = await response.json()

                if (this.currentTab === targetTab) {
                    this.posts = data.map(post => ({
                        post_id: post.id,
                        username: post.display_name,
                        content: post.content,
                        created_at: post.created_at
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch discover posts:', error)
                if (this.currentTab === targetTab) this.posts = []
            }
        },
        async fetchProfilePosts() {
            const targetTab = 'profile'
            try {
                const response = await fetch(`/posts/${this.username}?t=${Date.now()}`)
                const data = await response.json()

                if (this.currentTab === targetTab) {
                    this.profilePosts = data.map(post => ({
                        post_id: post.id,
                        username: post.display_name,
                        content: post.content,
                        created_at: post.created_at
                    }))
                }
            } catch (error) {
                console.error('Failed to fetch profile posts:', error)
                if (this.currentTab === targetTab) this.profilePosts = []
            }
        },
        handleLogin(username) {
            this.username = username
            localStorage.setItem('username', username)
            // Refresh the current view if logging in on profile tab
            this.handleTabChange(this.currentTab)
        },
        logout() {
            this.username = ''
            this.profilePosts = []
            localStorage.removeItem('username')
            this.currentTab = 'home'
            this.handleTabChange('home')
        },
        async submitPost() {
            if (!this.newPostContent.trim()) return
            try {
                const response = await fetch('/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username || 'anonymous',
                        content: this.newPostContent.trim()
                    })
                })
                if (response.ok) {
                    this.newPostContent = ''
                    if (this.currentTab === 'home') {
                        await this.fetchUserPosts()
                    } else if (this.currentTab === 'discover') {
                        await this.fetchDiscoverPosts()
                    }
                } else {
                    console.error('Failed to create post')
                }
            } catch (error) {
                console.error('Error creating post:', error)
            }
        },
    },
    components: {
        navbar: Navbar,
        'login-popup': LoginPopup,
        'post-input': PostInput,
        'post-item': Post,
    },
    mounted() {
        // Initial load
        this.handleTabChange('home')
    },
}).mount('#app')