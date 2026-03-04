import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from src.social_lib import SocialNetwork

def print_separator(title):
    """Print a nice separator with title"""
    print("\n" + "="*80)
    print(f" {title}")
    print("="*80)

def main():
    """Run tests for interesting queries"""
    sn = SocialNetwork()
    
    test_account_id = 1
    
    print_separator("TESTING INTERESTING QUERIES")
    print(f"Testing with account ID: {test_account_id} (alice_main)")
    
    print_separator("QUERY 1: Find Similar Accounts")
    print("Accounts that follow similar people to alice_main:")
    similar = sn.find_similar_accounts(test_account_id, limit=5)
    if similar:
        for acc in similar:
            print(f"  @{acc['username']} - {acc['similarity_score']}% similar "
                  f"(common follows: {acc['common_follows']})")
    else:
        print("  No similar accounts found")
    
    print_separator("QUERY 2: Account Suggestions")
    print("Accounts alice_main might want to follow:")
    suggestions = sn.suggest_accounts_to_follow(test_account_id, limit=5)
    if suggestions:
        for acc in suggestions:
            print(f"  @{acc['username']} - Score: {acc['recommendation_score']:.2f} "
                  f"(Followers: {acc['follower_count']}, Posts: {acc['post_count']})")
    else:
        print("  No suggestions found")
    
    print_separator("QUERY 3: Discover Posts")
    print("Posts from accounts alice_main doesn't follow, liked by accounts she does follow:")
    discovered = sn.posts_liked_by_followed_accounts(test_account_id, limit=5)
    if discovered:
        for post in discovered:
            print(f"  @{post['author_username']}: {post['content'][:50]}...")
            print(f"    Liked by {post['like_count_from_followed']} accounts you follow "
                  f"({post['followed_engagement_rate']}% engagement)")
            print(f"    Liked by: {post['liked_by_usernames']}")
    else:
        print("  No discovered posts found")
    
    print_separator("DATABASE STATS")
    with sn.get_connection() as conn:
        tables = ["users", "accounts", "follows", "posts", "likes", "replies", "blocks", "mentions"]
        for table in tables:
            cursor = conn.execute(f"SELECT COUNT(*) as count FROM {table}")
            count = cursor.fetchone()["count"]
            print(f"  {table}: {count}")

if __name__ == "__main__":
    main()
