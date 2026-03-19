-- reccomended posts, all '?' are the considered account id
SELECT p.post_id AS reccomended_post_id, count() AS likes 
FROM follows AS f 
JOIN likes AS l ON f.to_id = l.account_id 
JOIN posts AS p ON l.post_id = p.post_id 
WHERE f.from_id = ? 
AND p.account_id != ? 
AND p.account_id NOT IN (SELECT to_id FROM follows WHERE from_id = ?) 
GROUP BY p.post_id
ORDER BY likes desc;

-- reccomended accounts, all '?' are the considered account id
SELECT p.account_id AS reccomended_accounts, count() AS likes 
FROM follows AS f 
JOIN likes AS l ON f.to_id = l.account_id 
JOIN posts AS p ON l.post_id = p.post_id 
WHERE f.from_id = ? 
AND p.account_id != ? 
AND p.account_id NOT IN (SELECT to_id FROM follows WHERE from_id = ?) 
GROUP BY p.account_id
ORDER BY likes desc;

-- most popular follows, '?' is the considered account id
SELECT f.to_id AS followed_account, (count(DISTINCT l.like_id)*1.0)/(count(DISTINCT p.post_id)*1.0) AS ratio 
FROM follows AS f 
JOIN posts AS p on f.to_id = p.account_id 
LEFT JOIN likes AS l on p.post_id = l.post_id 
WHERE from_id = ? 
GROUP BY f.to_id
ORDER BY ratio desc;