import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from social_lib import SocialNetwork

def main():
    sn = SocialNetwork()
    test_account_id = 1
    
    print("\n" + "="*80)
    print(" TESTING INTERESTING QUERIES")
    print("="*80)
    print(f"Testing with account ID: {test_account_id} (alice_main)")
    
    print("\n" + "="*80)
    print(" QUERY 1: Find Similar Accounts")
    print("="*80)
    similar = sn.find_similar_accounts(test_account_id, limit=5)
    if similar:
        for acc in similar:
            print(f"  @{acc['username']} - {acc['similarity_score']}% similar "
                  f"(common follows: {acc['common_follows']})")
    else:
        print("  No similar accounts found")
    
    print("\n" + "="*80)
    print(" QUERY 2: Account Suggestions")
    print("="*80)
    suggestions = sn.suggest_accounts_to_follow(test_account_id, limit=5)
    if suggestions:
        for acc in suggestions:
            print(f"  @{acc['username']} - Score: {acc['recommendation_score']:.2f}")
    else:
        print("  No suggestions found")
    
    print("\n" + "="*80)
    print(" QUERY 3: Discover Posts")
    print("="*80)
    discovered = sn.posts_liked_by_followed_accounts(test_account_id, limit=5)
    if discovered:
        for post in discovered:
            print(f"  @{post['author_username']}: {post['content'][:50]}...")
            print(f"    Liked by {post['like_count_from_followed']} accounts you follow")
    else:
        print("  No discovered posts found")

if __name__ == "__main__":
    main()
