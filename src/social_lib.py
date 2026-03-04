import sqlite3
import re
from contextlib import contextmanager
from typing import List, Dict, Optional, Any
from pathlib import Path

DB_PATH = Path("database.db")

class SocialNetwork:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
    
    @contextmanager
    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            conn.close()
    
    def dict_from_row(self, row: sqlite3.Row) -> Dict[str, Any]:
        return dict(row) if row else None
    
    def create_user(self, email: str, display_name: Optional[str] = None) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'INSERT INTO users (email, display_name) VALUES (?, ?)',
                (email, display_name)
            )
            return cursor.lastrowid
    
    def get_user(self, user_id: int) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('SELECT * FROM users WHERE id = ?', (user_id,))
            row = cursor.fetchone()
            return self.dict_from_row(row)
    
    def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('SELECT * FROM users WHERE email = ?', (email,))
            row = cursor.fetchone()
            return self.dict_from_row(row)
    
    def list_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT u.*, COUNT(a.account_id) as account_count
                FROM users u
                LEFT JOIN accounts a ON u.id = a.user_id
                GROUP BY u.id
                ORDER BY u.created_at DESC
            ''')
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def create_account(self, user_id: int, username: str, bio: Optional[str] = None, 
                      is_private: bool = False) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute(
                '''INSERT INTO accounts 
                   (user_id, username, bio, is_private) 
                   VALUES (?, ?, ?, ?)''',
                (user_id, username, bio, is_private)
            )
            return cursor.lastrowid
    
    def get_account(self, account_id: int) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('SELECT * FROM accounts WHERE account_id = ?', (account_id,))
            return self.dict_from_row(cursor.fetchone())
    
    def get_account_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('SELECT * FROM accounts WHERE username = ?', (username,))
            return self.dict_from_row(cursor.fetchone())
    
    def list_accounts(self, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            if user_id:
                cursor = conn.execute(
                    'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at DESC',
                    (user_id,)
                )
            else:
                cursor = conn.execute('SELECT * FROM accounts ORDER BY created_at DESC')
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def update_account(self, account_id: int, **kwargs) -> bool:
        allowed_fields = {'bio', 'is_private', 'avatar_url'}
        updates = {k: v for k, v in kwargs.items() if k in allowed_fields}
        
        if not updates:
            return False
        
        set_clause = ', '.join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [account_id]
        
        with self.get_connection() as conn:
            cursor = conn.execute(
                f'UPDATE accounts SET {set_clause} WHERE account_id = ?',
                values
            )
            return cursor.rowcount > 0
    
    def follow(self, follower_id: int, followee_id: int) -> bool:
        with self.get_connection() as conn:
            try:
                conn.execute(
                    'INSERT INTO follows (follower_account_id, followee_account_id) VALUES (?, ?)',
                    (follower_id, followee_id)
                )
                return True
            except sqlite3.IntegrityError:
                return False
    
    def unfollow(self, follower_id: int, followee_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'DELETE FROM follows WHERE follower_account_id = ? AND followee_account_id = ?',
                (follower_id, followee_id)
            )
            return cursor.rowcount > 0
    
    def get_followers(self, account_id: int) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT a.* FROM accounts a
                JOIN follows f ON a.account_id = f.follower_account_id
                WHERE f.followee_account_id = ?
                ORDER BY f.followed_at DESC
            ''', (account_id,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def get_following(self, account_id: int) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT a.* FROM accounts a
                JOIN follows f ON a.account_id = f.followee_account_id
                WHERE f.follower_account_id = ?
                ORDER BY f.followed_at DESC
            ''', (account_id,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def is_following(self, follower_id: int, followee_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'SELECT 1 FROM follows WHERE follower_account_id = ? AND followee_account_id = ?',
                (follower_id, followee_id)
            )
            return cursor.fetchone() is not None
    
    def create_post(self, account_id: int, content: str) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'INSERT INTO posts (account_id, content) VALUES (?, ?)',
                (account_id, content)
            )
            post_id = cursor.lastrowid
            
            mentions = re.findall(r'@(\w+)', content)
            for username in mentions:
                mentioned = conn.execute(
                    'SELECT account_id FROM accounts WHERE username = ?',
                    (username,)
                ).fetchone()
                if mentioned:
                    conn.execute(
                        '''INSERT OR IGNORE INTO mentions 
                           (post_id, mentioned_account_id) VALUES (?, ?)''',
                        (post_id, mentioned['account_id'])
                    )
            return post_id
    
    def get_post(self, post_id: int) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT p.*, a.username, a.bio,
                       COUNT(DISTINCT l.like_id) as like_count,
                       COUNT(DISTINCT m.mention_id) as mention_count,
                       GROUP_CONCAT(DISTINCT mentioned.username) as mentioned_usernames
                FROM posts p
                JOIN accounts a ON p.account_id = a.account_id
                LEFT JOIN likes l ON p.post_id = l.post_id
                LEFT JOIN mentions m ON p.post_id = m.post_id
                LEFT JOIN accounts mentioned ON m.mentioned_account_id = mentioned.account_id
                WHERE p.post_id = ? AND p.is_deleted = 0
                GROUP BY p.post_id
            ''', (post_id,))
            row = cursor.fetchone()
            return self.dict_from_row(row) if row else None
    
    def list_posts(self, account_id: Optional[int] = None, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            if account_id:
                cursor = conn.execute('''
                    SELECT p.*, a.username,
                           COUNT(DISTINCT l.like_id) as like_count
                    FROM posts p
                    JOIN accounts a ON p.account_id = a.account_id
                    LEFT JOIN likes l ON p.post_id = l.post_id
                    WHERE p.account_id = ? AND p.is_deleted = 0
                    GROUP BY p.post_id
                    ORDER BY p.created_at DESC
                    LIMIT ?
                ''', (account_id, limit))
            else:
                cursor = conn.execute('''
                    SELECT p.*, a.username,
                           COUNT(DISTINCT l.like_id) as like_count
                    FROM posts p
                    JOIN accounts a ON p.account_id = a.account_id
                    LEFT JOIN likes l ON p.post_id = l.post_id
                    WHERE p.is_deleted = 0
                    GROUP BY p.post_id
                    ORDER BY p.created_at DESC
                    LIMIT ?
                ''', (limit,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def update_post(self, post_id: int, content: str) -> bool:
        with self.get_connection() as conn:
            conn.execute(
                'UPDATE posts SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE post_id = ?',
                (content, post_id)
            )
            
            conn.execute('DELETE FROM mentions WHERE post_id = ?', (post_id,))
            mentions = re.findall(r'@(\w+)', content)
            for username in mentions:
                mentioned = conn.execute(
                    'SELECT account_id FROM accounts WHERE username = ?',
                    (username,)
                ).fetchone()
                if mentioned:
                    conn.execute(
                        'INSERT INTO mentions (post_id, mentioned_account_id) VALUES (?, ?)',
                        (post_id, mentioned['account_id'])
                    )
            return True
    
    def delete_post(self, post_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'UPDATE posts SET is_deleted = 1 WHERE post_id = ?',
                (post_id,)
            )
            return cursor.rowcount > 0
    
    def get_feed(self, account_id: int, limit: int = 50) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            blocked = conn.execute('''
                SELECT blocked_account_id FROM blocks WHERE blocker_account_id = ?
                UNION
                SELECT blocker_account_id FROM blocks WHERE blocked_account_id = ?
            ''', (account_id, account_id)).fetchall()
            blocked_ids = [b['blocked_account_id'] for b in blocked]
            
            if blocked_ids:
                placeholders = ','.join('?' * len(blocked_ids))
                query = f'''
                    SELECT p.*, a.username, a.bio,
                           COUNT(DISTINCT l.like_id) as like_count,
                           EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND account_id = ?) as liked_by_user
                    FROM posts p
                    JOIN accounts a ON p.account_id = a.account_id
                    LEFT JOIN likes l ON p.post_id = l.post_id
                    WHERE p.is_deleted = 0
                    AND p.account_id IN (
                        SELECT followee_account_id FROM follows WHERE follower_account_id = ?
                    )
                    AND p.account_id NOT IN ({placeholders})
                    GROUP BY p.post_id
                    ORDER BY p.created_at DESC
                    LIMIT ?
                '''
                params = [account_id, account_id] + blocked_ids + [limit]
            else:
                query = '''
                    SELECT p.*, a.username, a.bio,
                           COUNT(DISTINCT l.like_id) as like_count,
                           EXISTS(SELECT 1 FROM likes WHERE post_id = p.post_id AND account_id = ?) as liked_by_user
                    FROM posts p
                    JOIN accounts a ON p.account_id = a.account_id
                    LEFT JOIN likes l ON p.post_id = l.post_id
                    WHERE p.is_deleted = 0
                    AND p.account_id IN (
                        SELECT followee_account_id FROM follows WHERE follower_account_id = ?
                    )
                    GROUP BY p.post_id
                    ORDER BY p.created_at DESC
                    LIMIT ?
                '''
                params = [account_id, account_id, limit]
            
            cursor = conn.execute(query, params)
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def like_post(self, account_id: int, post_id: int) -> bool:
        with self.get_connection() as conn:
            try:
                conn.execute(
                    'INSERT INTO likes (account_id, post_id) VALUES (?, ?)',
                    (account_id, post_id)
                )
                return True
            except sqlite3.IntegrityError:
                return False
    
    def unlike_post(self, account_id: int, post_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'DELETE FROM likes WHERE account_id = ? AND post_id = ?',
                (account_id, post_id)
            )
            return cursor.rowcount > 0
    
    def get_post_likes(self, post_id: int) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT a.* FROM accounts a
                JOIN likes l ON a.account_id = l.account_id
                WHERE l.post_id = ?
                ORDER BY l.liked_at DESC
            ''', (post_id,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def create_reply(self, post_id: int, account_id: int, content: str) -> int:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'INSERT INTO replies (post_id, account_id, content) VALUES (?, ?, ?)',
                (post_id, account_id, content)
            )
            return cursor.lastrowid
    
    def get_post_replies(self, post_id: int) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT r.*, a.username
                FROM replies r
                JOIN accounts a ON r.account_id = a.account_id
                WHERE r.post_id = ? AND r.is_deleted = 0
                ORDER BY r.created_at ASC
            ''', (post_id,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def block_account(self, blocker_id: int, blocked_id: int) -> bool:
        with self.get_connection() as conn:
            try:
                conn.execute(
                    'INSERT INTO blocks (blocker_account_id, blocked_account_id) VALUES (?, ?)',
                    (blocker_id, blocked_id)
                )
                conn.execute(
                    '''DELETE FROM follows 
                       WHERE (follower_account_id = ? AND followee_account_id = ?)
                          OR (follower_account_id = ? AND followee_account_id = ?)''',
                    (blocker_id, blocked_id, blocked_id, blocker_id)
                )
                return True
            except sqlite3.IntegrityError:
                return False
    
    def unblock_account(self, blocker_id: int, blocked_id: int) -> bool:
        with self.get_connection() as conn:
            cursor = conn.execute(
                'DELETE FROM blocks WHERE blocker_account_id = ? AND blocked_account_id = ?',
                (blocker_id, blocked_id)
            )
            return cursor.rowcount > 0
    
    def get_blocked_accounts(self, account_id: int) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                SELECT a.* FROM accounts a
                JOIN blocks b ON a.account_id = b.blocked_account_id
                WHERE b.blocker_account_id = ?
                ORDER BY b.blocked_at DESC
            ''', (account_id,))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def find_similar_accounts(self, account_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                WITH my_follows AS (
                    SELECT followee_account_id FROM follows WHERE follower_account_id = ?
                ),
                potential_matches AS (
                    SELECT 
                        f.follower_account_id as other_account,
                        COUNT(DISTINCT f.followee_account_id) as common_follows,
                        (SELECT COUNT(*) FROM my_follows) as my_total,
                        (SELECT COUNT(*) FROM follows WHERE follower_account_id = f.follower_account_id) as other_total
                    FROM follows f
                    WHERE f.follower_account_id != ?
                    AND f.followee_account_id IN (SELECT followee_account_id FROM my_follows)
                    AND NOT EXISTS (
                        SELECT 1 FROM blocks 
                        WHERE (blocker_account_id = ? AND blocked_account_id = f.follower_account_id)
                           OR (blocker_account_id = f.follower_account_id AND blocked_account_id = ?)
                    )
                    GROUP BY f.follower_account_id
                )
                SELECT 
                    a.*,
                    pm.common_follows,
                    ROUND(CAST(pm.common_follows AS FLOAT) / 
                          (pm.my_total + pm.other_total - pm.common_follows) * 100, 2) 
                          as similarity_score
                FROM potential_matches pm
                JOIN accounts a ON pm.other_account = a.account_id
                ORDER BY similarity_score DESC
                LIMIT ?
            ''', (account_id, account_id, account_id, account_id, limit))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def suggest_accounts_to_follow(self, account_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                WITH my_follows AS (
                    SELECT followee_account_id FROM follows WHERE follower_account_id = ?
                ),
                follows_of_follows AS (
                    SELECT DISTINCT f2.followee_account_id
                    FROM follows f1
                    JOIN follows f2 ON f1.followee_account_id = f2.follower_account_id
                    WHERE f1.follower_account_id = ?
                    AND f2.followee_account_id NOT IN (SELECT followee_account_id FROM my_follows)
                    AND f2.followee_account_id != ?
                ),
                account_scores AS (
                    SELECT 
                        fof.followee_account_id as account_id,
                        COUNT(*) as follower_count,
                        (SELECT COUNT(*) FROM posts WHERE account_id = fof.followee_account_id AND is_deleted = 0) as post_count,
                        (SELECT COUNT(*) FROM likes l 
                         JOIN posts p ON l.post_id = p.post_id 
                         WHERE p.account_id = fof.followee_account_id) as total_likes_received
                    FROM follows_of_follows fof
                    LEFT JOIN follows f ON fof.followee_account_id = f.followee_account_id
                    GROUP BY fof.followee_account_id
                )
                SELECT 
                    a.*,
                    ascores.follower_count,
                    ascores.post_count,
                    ascores.total_likes_received,
                    (ascores.follower_count * 0.4 + 
                     ascores.post_count * 0.3 + 
                     ascores.total_likes_received * 0.3) as recommendation_score
                FROM account_scores ascores
                JOIN accounts a ON ascores.account_id = a.account_id
                WHERE NOT EXISTS (
                    SELECT 1 FROM blocks 
                    WHERE (blocker_account_id = ? AND blocked_account_id = ascores.account_id)
                       OR (blocker_account_id = ascores.account_id AND blocked_account_id = ?)
                )
                ORDER BY recommendation_score DESC
                LIMIT ?
            ''', (account_id, account_id, account_id, account_id, account_id, limit))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
    
    def posts_liked_by_followed_accounts(self, account_id: int, limit: int = 20) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            cursor = conn.execute('''
                WITH my_follows AS (
                    SELECT followee_account_id FROM follows WHERE follower_account_id = ?
                ),
                liked_posts AS (
                    SELECT 
                        p.post_id,
                        p.account_id as post_author_id,
                        p.content,
                        p.created_at,
                        a.username as author_username,
                        COUNT(DISTINCT l.account_id) as like_count_from_followed,
                        GROUP_CONCAT(DISTINCT af.username) as liked_by_usernames
                    FROM posts p
                    JOIN likes l ON p.post_id = l.post_id
                    JOIN accounts a ON p.account_id = a.account_id
                    JOIN accounts af ON l.account_id = af.account_id
                    WHERE l.account_id IN (SELECT followee_account_id FROM my_follows)
                    AND p.account_id NOT IN (SELECT followee_account_id FROM my_follows)
                    AND p.account_id != ?
                    AND p.is_deleted = 0
                    AND NOT EXISTS (
                        SELECT 1 FROM blocks 
                        WHERE (blocker_account_id = ? AND blocked_account_id = p.account_id)
                           OR (blocker_account_id = p.account_id AND blocked_account_id = ?)
                    )
                    GROUP BY p.post_id
                )
                SELECT *,
                       ROUND(like_count_from_followed * 100.0 / 
                       (SELECT COUNT(*) FROM my_follows), 2) as followed_engagement_rate
                FROM liked_posts
                ORDER BY like_count_from_followed DESC, created_at DESC
                LIMIT ?
            ''', (account_id, account_id, account_id, account_id, limit))
            return [self.dict_from_row(row) for row in cursor.fetchall()]
