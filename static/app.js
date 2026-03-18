const { createApp } = Vue

createApp({
    data() {
        return {
            currentTab: 'home',
            username: localStorage.getItem('username') || '',
            accountId: localStorage.getItem('accountId') || null,
            posts: [],
            discoverPosts: [],
            profilePosts: [],
            topics: [],
            topicPosts: [],
            selectedTopic: null,
            message: 'Welcome! Select a tab to get started.',
            newPostContent: '',
            selectedTopicId: null,
            followerCount: 0,
            followingCount: 0,
            isFollowingUser: false,
            isBlockedUser: false,
            viewingOwnProfile: false,
            showFollowButton: false,
            // Modal state
            showFollowersModal: false,
            showFollowingModal: false,
            showBlocksModal: false,
            // Modal data
            followersList: [],
            followingList: [],
            blockedUsersList: [],
            // Current viewed profile account ID (for modals)
            currentProfileAccountId: null
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
            this.selectedTopic = null

            if (tab === 'home' && this.username) {
                this.posts = []
                await this.fetchUserPosts()
            } else if (tab === 'discover') {
                this.posts = []
                this.topicPosts = []
                await this.fetchTopics()
            } else if (tab === 'profile' && this.username) {
                this.profilePosts = []
                await this.fetchProfilePosts()
            }
        },
        async fetchTopics() {
            try {
                this.topics = await API.fetchTopics()
                
                // Fetch post counts for each topic
                for (const topic of this.topics) {
                    const posts = await API.fetchPostsByTopic(topic.topic_id)
                    topic.postCount = posts.length
                }
            } catch (error) {
                console.error('Failed to fetch topics:', error)
            }
        },
        async selectTopic(topic) {
            this.selectedTopic = topic
            try {
                this.topicPosts = await API.fetchPostsByTopic(topic.topic_id, this.accountId)
            } catch (error) {
                console.error('Failed to fetch topic posts:', error)
                this.topicPosts = []
            }
        },
        backToTopics() {
            this.selectedTopic = null
            this.topicPosts = []
        },
        async loadProfileStats(targetAccountId) {
            try {
                const [followers, following] = await Promise.all([
                    API.getFollowers(targetAccountId),
                    API.getFollowing(targetAccountId)
                ])
                this.followerCount = followers.length
                this.followingCount = following.length
                this.currentProfileAccountId = targetAccountId

                // Check if current user is viewing their own profile
                this.viewingOwnProfile = this.accountId && targetAccountId === parseInt(this.accountId)
                this.showFollowButton = !this.viewingOwnProfile

                // Check if already following
                if (!this.viewingOwnProfile && this.accountId) {
                    this.isFollowingUser = await API.isFollowing(parseInt(this.accountId), targetAccountId)
                    this.isBlockedUser = await API.isBlocked(parseInt(this.accountId), targetAccountId)
                }
            } catch (error) {
                console.error('Failed to load profile stats:', error)
            }
        },
        async toggleFollow() {
            if (!this.accountId) return

            // Find the target account (profile being viewed)
            const accounts = await API.fetchAccounts()
            const targetAccount = accounts.find(acc => acc.username === this.username)

            if (!targetAccount) return

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

            if (this.isFollowingUser) {
                // Unfollow
                await fetch('/follows', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_id: parseInt(this.accountId),
                        to_id: targetAccount.account_id
                    })
                })
                this.isFollowingUser = false
                this.followerCount--
            } else {
                // Follow
                await API.createFollow(parseInt(this.accountId), targetAccount.account_id, now)
                this.isFollowingUser = true
                this.followerCount++
            }
        },
        async toggleBlock() {
            if (!this.accountId || !this.currentProfileAccountId) return

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

            if (this.isBlockedUser) {
                // Unblock
                await fetch('/blocks', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_id: parseInt(this.accountId),
                        to_id: this.currentProfileAccountId
                    })
                })
                this.isBlockedUser = false
            } else {
                // Block
                await API.createBlock(parseInt(this.accountId), this.currentProfileAccountId, now)
                this.isBlockedUser = true
                // Also unfollow if following
                if (this.isFollowingUser) {
                    await this.toggleFollow()
                }
            }
        },
        openFollowersModal() {
            this.showFollowersModal = true
            this.loadFollowersList()
        },
        openFollowingModal() {
            this.showFollowingModal = true
            this.loadFollowingList()
        },
        openBlocksModal() {
            this.showBlocksModal = true
            this.loadBlockedUsersList()
        },
        async loadFollowersList() {
            if (!this.currentProfileAccountId) return
            try {
                this.followersList = await API.getFollowers(this.currentProfileAccountId)
            } catch (error) {
                console.error('Failed to load followers:', error)
                this.followersList = []
            }
        },
        async loadFollowingList() {
            if (!this.currentProfileAccountId) return
            try {
                this.followingList = await API.getFollowing(this.currentProfileAccountId)
            } catch (error) {
                console.error('Failed to load following:', error)
                this.followingList = []
            }
        },
        async loadBlockedUsersList() {
            if (!this.accountId) return
            try {
                this.blockedUsersList = await API.getBlockedUsers(parseInt(this.accountId))
            } catch (error) {
                console.error('Failed to load blocked users:', error)
                this.blockedUsersList = []
            }
        },
        async handleUnblock(user) {
            if (!this.accountId) return
            try {
                await fetch('/blocks', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_id: parseInt(this.accountId),
                        to_id: user.account_id
                    })
                })
                // Remove from list
                this.blockedUsersList = this.blockedUsersList.filter(u => u.account_id !== user.account_id)
            } catch (error) {
                console.error('Failed to unblock user:', error)
            }
        },
        viewUserProfile(user) {
            this.username = user.username
            this.currentProfileAccountId = user.account_id
            this.loadProfileStats(user.account_id)
            this.fetchProfilePosts()
        },
        async fetchUserPosts() {
            const targetTab = 'home'
            try {
                if (!this.accountId) {
                    if (this.currentTab === targetTab) this.posts = []
                    return
                }
                const data = await API.fetchUserFeed(this.accountId)

                if (this.currentTab === targetTab) {
                    this.posts = data
                }
            } catch (error) {
                console.error('Failed to fetch user feed:', error)
                if (this.currentTab === targetTab) this.posts = []
            }
        },
        async fetchDiscoverPosts() {
            const targetTab = 'discover'
            try {
                const data = await API.fetchAllPosts(this.accountId)

                if (this.currentTab === targetTab) {
                    this.posts = data
                }
            } catch (error) {
                console.error('Failed to fetch discover posts:', error)
                if (this.currentTab === targetTab) this.posts = []
            }
        },
        async fetchProfilePosts() {
            const targetTab = 'profile'
            try {
                // First get the account to find the account_id
                const accounts = await API.fetchAccounts()
                const account = accounts.find(acc => acc.username === this.username)
                
                if (account) {
                    await this.loadProfileStats(account.account_id)
                }
                
                const data = await API.fetchPostsByUsername(this.username, this.accountId)

                if (this.currentTab === targetTab) {
                    this.profilePosts = data
                }
            } catch (error) {
                console.error('Failed to fetch profile posts:', error)
                if (this.currentTab === targetTab) this.profilePosts = []
            }
        },
        handleLogin(username) {
            this.username = username
            this.accountId = localStorage.getItem('accountId')
            // Refresh the current view if logging in on profile tab
            this.handleTabChange(this.currentTab)
        },
        logout() {
            this.username = ''
            this.accountId = null
            this.profilePosts = []
            localStorage.removeItem('username')
            localStorage.removeItem('accountId')
            localStorage.removeItem('personId')
            this.currentTab = 'home'
            this.handleTabChange('home')
        },
        async submitPost(topicId) {
            if (!this.newPostContent.trim() || !topicId) return
            
            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
            const content = this.newPostContent.trim()
            
            // Use first line as title, rest as body
            const lines = content.split('\n')
            const title = lines[0].slice(0, 100) || 'Untitled'
            const body = lines.length > 1 ? lines.slice(1).join('\n') : content

            try {
                await API.createPost(
                    parseInt(this.accountId),
                    topicId,
                    title,
                    body,
                    now
                )
                
                this.newPostContent = ''
                if (this.currentTab === 'home') {
                    await this.fetchUserPosts()
                } else if (this.currentTab === 'discover') {
                    await this.fetchDiscoverPosts()
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
        'topic-card': TopicCard,
        'user-list-modal': UserListModal,
    },
    mounted() {
        // Initial load
        this.handleTabChange('home')
    },
}).mount('#app')