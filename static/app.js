const { createApp } = Vue

createApp({
    data() {
        return {
            currentTab: 'home',
            username: localStorage.getItem('username') || '',
            accountId: localStorage.getItem('accountId') || null,
            viewingUsername: localStorage.getItem('username') || '',
            viewingAccountId: localStorage.getItem('accountId') || null,
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
            viewingOwnProfile: true,
            showFollowButton: false,
            showFollowersModal: false,
            showFollowingModal: false,
            showBlocksModal: false,
            followersList: [],
            followingList: [],
            blockedUsersList: [],
            currentProfileAccountId: null,
            recommendedPosts: [],
            recommendedAccounts: [],
            popularFollows: [],
            showRecommendations: false,
            showPostModal: false,
            selectedPost: null,
            postReplies: []
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
                await this.fetchRecommendations()
            } else if (tab === 'discover') {
                this.posts = []
                this.topicPosts = []
                await this.fetchTopics()
            } else if (tab === 'profile' && this.username) {
                this.viewingUsername = this.username
                this.viewingAccountId = this.accountId
                this.profilePosts = []
                await this.fetchProfilePosts()
                await this.loadProfileStats(parseInt(this.accountId))
            }
        },
        
        async viewPost(post) {
            try {
                const replies = await API.fetchRepliesByPost(post.post_id)
                this.selectedPost = post
                this.postReplies = replies
                this.showPostModal = true
            } catch (error) {
                console.error('Failed to fetch post details:', error)
            }
        },
        
        closePostModal() {
            this.showPostModal = false
            this.selectedPost = null
            this.postReplies = []
        },
        
        viewOwnProfile() {
            this.viewingUsername = this.username
            this.viewingAccountId = this.accountId
            this.currentTab = 'profile'
            this.fetchProfilePosts()
            this.loadProfileStats(parseInt(this.accountId))
        },
        
        async viewUserProfile(user) {
            this.viewingUsername = user.username
            this.viewingAccountId = user.account_id
            this.currentTab = 'profile'
            await this.loadProfileStats(user.account_id)
            await this.fetchProfilePosts()
        },
        
        async fetchRecommendations() {
            if (!this.accountId) return
            
            try {
                const [posts, accounts, popular] = await Promise.all([
                    API.fetchRecommendedPosts(parseInt(this.accountId)),
                    API.fetchRecommendedAccounts(parseInt(this.accountId)),
                    API.fetchPopularFollows(parseInt(this.accountId))
                ])
                
                const blockedUsers = await API.getBlockedUsers(parseInt(this.accountId))
                const blockedIds = blockedUsers.map(u => u.account_id)
                
                this.recommendedPosts = posts.filter(post => !blockedIds.includes(post.account_id))
                this.recommendedAccounts = accounts.filter(acc => !blockedIds.includes(acc.account_id))
                this.popularFollows = popular.filter(acc => !blockedIds.includes(acc.account_id))
                this.showRecommendations = true
            } catch (error) {
                console.error('Failed to fetch recommendations:', error)
            }
        },
        
        viewRecommendedPost(post) {
            this.viewPost(post)
        },
        
        viewAllRecommendedPosts() {
            console.log('View all recommended posts')
        },
        
        viewAllRecommendedAccounts() {
            console.log('View all recommended accounts')
        },
        
        async fetchTopics() {
            try {
                this.topics = await API.fetchTopics()
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

                this.viewingOwnProfile = this.accountId && targetAccountId === parseInt(this.accountId)
                this.showFollowButton = !this.viewingOwnProfile

                if (!this.viewingOwnProfile && this.accountId) {
                    this.isFollowingUser = await API.isFollowing(parseInt(this.accountId), targetAccountId)
                    this.isBlockedUser = await API.isBlocked(parseInt(this.accountId), targetAccountId)
                } else {
                    this.isFollowingUser = false
                    this.isBlockedUser = false
                }
            } catch (error) {
                console.error('Failed to load profile stats:', error)
            }
        },
        
        async toggleFollow() {
            if (!this.accountId) return

            const now = new Date().toISOString().slice(0, 19).replace('T', ' ')

            if (this.isFollowingUser) {
                await fetch('/follows', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        from_id: parseInt(this.accountId),
                        to_id: this.currentProfileAccountId
                    })
                })
                this.isFollowingUser = false
                this.followerCount--
            } else {
                await API.createFollow(parseInt(this.accountId), this.currentProfileAccountId, now)
                this.isFollowingUser = true
                this.followerCount++
            }
            
            await this.fetchRecommendations()
        },
        
        async toggleBlock() {
            if (!this.accountId || !this.currentProfileAccountId) return

            if (this.isBlockedUser) {
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
                await API.createBlock(parseInt(this.accountId), this.currentProfileAccountId)
                this.isBlockedUser = true
                if (this.isFollowingUser) {
                    await this.toggleFollow()
                }
            }
            
            await this.fetchRecommendations()
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
                this.blockedUsersList = this.blockedUsersList.filter(u => u.account_id !== user.account_id)
                await this.fetchRecommendations()
            } catch (error) {
                console.error('Failed to unblock user:', error)
            }
        },
        
        async fetchUserPosts() {
            try {
                if (!this.accountId) {
                    this.posts = []
                    return
                }
                const data = await API.fetchUserFeed(this.accountId)
                this.posts = data
            } catch (error) {
                console.error('Failed to fetch user feed:', error)
                this.posts = []
            }
        },
        
        async fetchProfilePosts() {
            try {
                if (!this.viewingUsername) return
                const data = await API.fetchPostsByUsername(this.viewingUsername, this.accountId)
                this.profilePosts = data
            } catch (error) {
                console.error('Failed to fetch profile posts:', error)
                this.profilePosts = []
            }
        },
        
        handleLogin(username) {
            this.username = username
            this.viewingUsername = username
            this.accountId = localStorage.getItem('accountId')
            this.viewingAccountId = this.accountId
            this.handleTabChange(this.currentTab)
        },
        
        logout() {
            this.username = ''
            this.viewingUsername = ''
            this.accountId = null
            this.viewingAccountId = null
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
                } else if (this.currentTab === 'profile' && this.viewingOwnProfile) {
                    await this.fetchProfilePosts()
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
        'recommended-posts': RecommendedPosts,
        'recommended-accounts': RecommendedAccounts,
        'popular-follows': PopularFollows,
        'post-modal': PostModal
    },
    mounted() {
        this.handleTabChange('home')
    },
}).mount('#app')
