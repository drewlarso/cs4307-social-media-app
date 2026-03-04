const { createApp } = Vue

createApp({
    data() {
        return {
            currentTab: 'discover',
            username: localStorage.getItem('username') || '',
            posts: [],
            profilePosts: [],
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
                await this.fetchPosts()
            } else if (tab === 'profile' && this.username) {
                await this.fetchProfilePosts()
            }
        },
        async fetchPosts() {
            try {
                const response = await fetch('/posts')
                const data = await response.json()
                this.posts = data
            } catch (error) {
                console.error('Failed to fetch posts:', error)
                this.posts = []
            }
        },
        async fetchProfilePosts() {
            try {
                const response = await fetch(`/posts/${this.username}`)
                const data = await response.json()
                this.profilePosts = data
            } catch (error) {
                console.error('Failed to fetch profile posts:', error)
                this.profilePosts = []
            }
        },
        handleLogin(username) {
            this.username = username
        },
        logout() {
            this.username = ''
            localStorage.removeItem('username')
        },
    },
    components: {
        navbar: Navbar,
        'login-popup': LoginPopup,
        'post-item': Post,
    },
    mounted() {
        this.handleTabChange('discover')
    },
}).mount('#app')
