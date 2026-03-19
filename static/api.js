// API utility for interacting with the backend
const API = {
    // NEW: Helper to filter out blocked accounts
    async filterBlockedContent(accountId, items, itemType = 'post') {
        if (!accountId || !items || items.length === 0) return items
        
        try {
            const blockedUsers = await this.getBlockedUsers(parseInt(accountId))
            const blockedIds = blockedUsers.map(u => u.account_id)
            
            if (blockedIds.length === 0) return items
            
            // Filter based on item type
            if (itemType === 'post' || itemType === 'reply') {
                return items.filter(item => !blockedIds.includes(item.account_id))
            } else if (itemType === 'account') {
                return items.filter(item => !blockedIds.includes(item.account_id))
            } else if (itemType === 'popular') {
                return items.filter(item => !blockedIds.includes(item.account_id))
            }
            return items
        } catch (error) {
            console.error('Error filtering blocked content:', error)
            return items
        }
    },

    // Transform a post from backend format to frontend format
    transformPost(post) {
        return {
            post_id: post.post_id,
            username: post.username,
            account_id: post.account_id,
            title: post.title,
            content: post.body,
            created_at: post.created_date,
            topic_id: post.topic_id
        }
    },

    // Transform posts array
    transformPosts(posts) {
        return posts.map(post => this.transformPost(post))
    },

    // Fetch all posts (for discover tab) - UPDATED to filter blocked
    async fetchAllPosts(viewerId = null) {
        let url = '/posts?t=' + Date.now()
        if (viewerId) url += `&viewer_id=${viewerId}`
        const response = await fetch(url)
        const data = await response.json()
        const posts = this.transformPosts(data)
        
        // Filter out posts from blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, posts, 'post')
        }
        return posts
    },

    // Fetch posts by username - UPDATED to filter blocked
    async fetchPostsByUsername(username, viewerId = null) {
        let url = `/posts/${encodeURIComponent(username)}?t=${Date.now()}`
        if (viewerId) url += `&viewer_id=${viewerId}`
        const response = await fetch(url)
        const data = await response.json()
        const posts = this.transformPosts(data)
        
        // Filter out posts from blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, posts, 'post')
        }
        return posts
    },

    // Fetch feed containing posts from user and users they follow - UPDATED to filter blocked
    async fetchUserFeed(accountId) {
        const response = await fetch(`/accounts/${accountId}/feed?t=${Date.now()}`)
        const data = await response.json()
        const posts = this.transformPosts(data)
        
        // Filter out posts from blocked accounts
        return await this.filterBlockedContent(accountId, posts, 'post')
    },

    // Fetch all topics
    async fetchTopics() {
        const response = await fetch('/topics?t=' + Date.now())
        return await response.json()
    },

    // Fetch posts by topic - UPDATED to filter blocked
    async fetchPostsByTopic(topicId, viewerId = null) {
        let url = `/topics/${topicId}/posts?t=${Date.now()}`
        if (viewerId) url += `&viewer_id=${viewerId}`
        const response = await fetch(url)
        const data = await response.json()
        const posts = this.transformPosts(data)
        
        // Filter out posts from blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, posts, 'post')
        }
        return posts
    },

    // Fetch all accounts - UPDATED to filter blocked
    async fetchAccounts(viewerId = null) {
        const response = await fetch('/accounts?t=' + Date.now())
        const data = await response.json()
        
        // Filter out blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, data, 'account')
        }
        return data
    },

    // Create a new person
    async createPerson(email, name, birthday) {
        const response = await fetch('/people', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, name, birthday })
        })
        return await response.json()
    },

    // Create a new account
    async createAccount(personId, username, createdDate) {
        const response = await fetch('/accounts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ person_id: personId, username, created_date: createdDate })
        })
        return await response.json()
    },

    // Create a new post
    async createPost(accountId, topicId, title, body, createdDate) {
        const response = await fetch('/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                account_id: accountId,
                topic_id: topicId,
                title,
                body,
                created_date: createdDate
            })
        })
        return await response.json()
    },

    // Create a like
    async createLike(accountId, postId, likeType = 1) {
        const response = await fetch('/likes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                account_id: accountId,
                post_id: postId,
                like_type: likeType
            })
        })
        return await response.json()
    },

    // Delete a like
    async deleteLike(accountId, postId) {
        const response = await fetch('/likes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ account_id: accountId, post_id: postId })
        })
        return await response.json()
    },

    // Fetch likes for a post - UPDATED to filter blocked
    async fetchLikesByPost(postId, viewerId = null) {
        const response = await fetch(`/posts/${postId}/likes?t=${Date.now()}`)
        const data = await response.json()
        
        // Filter out likes from blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, data, 'account')
        }
        return data
    },

    // Check if user has liked a post
    async hasUserLikedPost(accountId, postId) {
        const likes = await this.fetchLikesByPost(postId)
        return likes.some(like => like.account_id === accountId)
    },

    // Fetch like count for a post
    async fetchLikeCount(postId) {
        const likes = await this.fetchLikesByPost(postId)
        return likes.length
    },

    // Fetch replies for a post - backend already filters blocked accounts
    async fetchRepliesByPost(postId, viewerId = null) {
        let url = `/posts/${postId}/replies?t=${Date.now()}`
        if (viewerId) url += `&viewer_id=${viewerId}`
        const response = await fetch(url)
        const data = await response.json()
        return data.map(reply => ({
            reply_id: reply.reply_id,
            username: reply.username,
            content: reply.body,
            created_at: reply.created_date,
            account_id: reply.account_id
        }))
    },

    // Create a reply
    async createReply(accountId, postId, body, createdDate) {
        const response = await fetch('/replies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                account_id: accountId,
                post_id: postId,
                body,
                created_date: createdDate
            })
        })
        return await response.json()
    },

    // Create a follow
    async createFollow(fromId, toId, createdDate) {
        const response = await fetch('/follows', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_id: fromId,
                to_id: toId,
                created_date: createdDate
            })
        })
        return await response.json()
    },

    // Get follows for an account
    async getFollows(accountId) {
        const response = await fetch(`/follows/${accountId}?t=${Date.now()}`)
        return await response.json()
    },

    // Get followers for an account - UPDATED to filter blocked
    async getFollowers(accountId, viewerId = null) {
        const response = await fetch(`/accounts/${accountId}/followers?t=${Date.now()}`)
        const data = await response.json()
        
        // Filter out blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, data, 'account')
        }
        return data
    },

    // Get following for an account - UPDATED to filter blocked
    async getFollowing(accountId, viewerId = null) {
        const response = await fetch(`/accounts/${accountId}/following?t=${Date.now()}`)
        const data = await response.json()
        
        // Filter out blocked accounts
        if (viewerId) {
            return await this.filterBlockedContent(viewerId, data, 'account')
        }
        return data
    },

    // Check if account is following another
    async isFollowing(accountId, targetId) {
        const response = await fetch(`/accounts/${accountId}/is-following?target_id=${targetId}&t=${Date.now()}`)
        const data = await response.json()
        return data.following
    },

    // Get user's account by username
    async getAccountByUsername(username) {
        const accounts = await this.fetchAccounts()
        return accounts.find(acc => {
            return true
        })
    },

    // Create a block
    async createBlock(fromId, toId) {
        const response = await fetch('/blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                from_id: fromId,
                to_id: toId
            })
        })
        return await response.json()
    },

    // Get blocked users for an account
    async getBlockedUsers(accountId) {
        const response = await fetch(`/blocks/${accountId}?t=${Date.now()}`)
        return await response.json()
    },

    // Check if account is blocking another
    async isBlocked(accountId, targetId) {
        const response = await fetch(`/accounts/${accountId}/is-blocking?target_id=${targetId}&t=${Date.now()}`)
        const data = await response.json()
        return data.blocking
    },

    // Create a password for an account
    async createPassword(accountId, password) {
        const response = await fetch('/passwords', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                account_id: accountId,
                secure_password: password
            })
        })
        return await response.json()
    },

    // Fetch recommended posts for an account - UPDATED to filter blocked
    async fetchRecommendedPosts(accountId) {
        const response = await fetch(`/accounts/${accountId}/recommended-posts?t=${Date.now()}`)
        const data = await response.json()
        const recommendedPosts = []
        
        for (const item of data) {
            try {
                const postResponse = await fetch(`/posts?t=${Date.now()}`)
                const allPosts = await postResponse.json()
                const post = allPosts.find(p => p.post_id === item.reccomended_post_id)
                if (post) {
                    // Check if post author is blocked
                    const blockedUsers = await this.getBlockedUsers(accountId)
                    const blockedIds = blockedUsers.map(u => u.account_id)
                    
                    if (!blockedIds.includes(post.account_id)) {
                        recommendedPosts.push({
                            ...this.transformPost(post),
                            like_count: item.likes,
                            recommendation_score: item.likes
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching post details:', error)
            }
        }
        return recommendedPosts
    },

    // Fetch recommended accounts for an account - UPDATED to filter blocked
    async fetchRecommendedAccounts(accountId) {
        const response = await fetch(`/accounts/${accountId}/recommended-accounts?t=${Date.now()}`)
        const data = await response.json()
        const recommendedAccounts = []
        
        const blockedUsers = await this.getBlockedUsers(accountId)
        const blockedIds = blockedUsers.map(u => u.account_id)
        
        for (const item of data) {
            try {
                if (!blockedIds.includes(item.reccomended_accounts)) {
                    const accounts = await this.fetchAccounts()
                    const account = accounts.find(a => a.account_id === item.reccomended_accounts)
                    if (account) {
                        recommendedAccounts.push({
                            account_id: account.account_id,
                            username: account.username,
                            like_count: item.likes,
                            recommendation_score: item.likes
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching account details:', error)
            }
        }
        return recommendedAccounts
    },

    // Fetch popular follows - UPDATED to filter blocked
    async fetchPopularFollows(accountId) {
        const response = await fetch(`/accounts/${accountId}/popular-follows?t=${Date.now()}`)
        const data = await response.json()
        const popularFollows = []
        
        const blockedUsers = await this.getBlockedUsers(accountId)
        const blockedIds = blockedUsers.map(u => u.account_id)
        
        for (const item of data) {
            try {
                if (!blockedIds.includes(item.followed_account)) {
                    const accounts = await this.fetchAccounts()
                    const account = accounts.find(a => a.account_id === item.followed_account)
                    if (account) {
                        popularFollows.push({
                            account_id: account.account_id,
                            username: account.username,
                            engagement_ratio: item.ratio
                        })
                    }
                }
            } catch (error) {
                console.error('Error fetching account details:', error)
            }
        }
        return popularFollows
    }
}
