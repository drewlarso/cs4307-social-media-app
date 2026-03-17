If the data is given in the url

Like this:

```python
@app.get("/posts/{username}")
async def get_posts_by_user(username: str):
```

The JS fetch request looks something like:

```javascript
const response = await fetch('localhost:8000/posts/102')
const data = await response.json()
```

If the route needs more data

Like this

```python
@app.post("/posts")
async def create_post(request: Request):
```

The JS fetch request looks something like:

```javascript
const response = await fetch('localhost:8000/posts', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
})
```
