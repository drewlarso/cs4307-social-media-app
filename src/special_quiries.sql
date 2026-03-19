-- select username, (count(distinct l.like_id)*1.0 )/(count(distinct p.post_id)*1.0) as ratio 
-- from accounts as a join posts as p on a.account_id = p.account_id 
-- join likes as l on p.post_id = l.post_id group by a.account_id;

-- reccomended posts, all '?' are the considered account id
SELECT p.post_id AS reccomended_post_id, count() AS likes 
FROM follows AS f 
JOIN likes AS l ON f.to_id = l.account_id 
JOIN posts as p on l.post_id = p.post_id 
WHERE f.from_id = ? 
AND p.account_id != ? 
AND p.account_id NOT IN (SELECT to_id FROM follows WHERE from_id = ?) 
GROUP BY p.post_id
ORDER BY likes desc;

-- best follow (most interacted follow), all '?' are the considered account id
