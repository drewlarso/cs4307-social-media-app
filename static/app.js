const { createApp } = Vue

createApp({
    data() {
        return {
            currentTab: 'discover',
            username: localStorage.getItem('username') || '',
            posts: [],
            profilePosts: [],
            // Added a message property so the 'else' block doesn't crash
            message: 'Welcome! Select a tab to get started.' 
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
            
            if (tab === 'discover') {
                // Clear old posts so the "No posts" or "Loading" logic triggers correctly
                this.posts = [] 
                await this.fetchPosts()
            } else if (tab === 'profile' && this.username) {
                this.profilePosts = []
                await this.fetchProfilePosts()
            }
        },
        async fetchPosts() {
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
                console.error('Failed to fetch posts:', error)
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
            this.currentTab = 'discover'
            this.handleTabChange('discover')
        },
        async createPost() {
            const placeholderContent = `whats up`
            try {
                const response = await fetch('/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: this.username || 'anonymous',
                        content: placeholderContent
                    })
                })
                if (response.ok) {
                    console.log('Post created successfully')
                    await this.fetchPosts()
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
        'post-item': Post,
    },
    mounted() {
        // Initial load
        this.handleTabChange('discover')
    },
}).mount('#app')