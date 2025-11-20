const express = require('express'); 
const router  = express.Router();
const db      = require('../database/blog');

// Home redirect
router.get('/', (req, res) => {
  res.redirect('/posts');
});

// List posts
router.get('/posts', async (req, res) => {
  const [posts] = await db.query(
    `SELECT posts.*, author.name AS author_name
     FROM posts 
     INNER JOIN author ON posts.author_id = author.id`
  );

  res.render('posts-list.ejs', { posts });
});

// New post form
router.get('/new-post', async (req, res) => {
  const [authors] = await db.query("SELECT * FROM author");

  res.render("create-post.ejs", {
    authors: authors || []
  });
});

// Create post
router.post('/posts', async (req, res, next) => {
  try {
    console.log("FORM DATA:", req.body);

    const query = `
      INSERT INTO posts (title, summary, body, author_id)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(query, [
      req.body.title,
      req.body.summary,
      req.body.content,
      req.body.author,
    ]);

    res.redirect('/posts');
  } catch (err) {
    console.log("INSERT ERROR:", err);
    next(err);
  }
});

// View post detail
router.get('/posts/:id', async (req, res) => {
  const [rows] = await db.query(
    `SELECT posts.*, author.name AS author_name, author.email AS author_email
     FROM posts
     INNER JOIN author ON posts.author_id = author.id
     WHERE posts.id = ?`,
    [req.params.id]
  );

  if (!rows || rows.length === 0) {
    return res.status(404).render("404");
  }

  const post = rows[0];
  const dateObj = post.date ? new Date(post.date) : null;

  const postdata = {
    ...post,
    date: dateObj ? dateObj.toISOString() : null,
    humanreadabledate: dateObj
      ? dateObj.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          year: "numeric",
          day: "numeric",
        })
      : null,
  };

  res.render("post-detail.ejs", { post: postdata });
});

// Edit post form
router.get('/posts/:id/edit', async (req, res) => {
  const [rows] = await db.query(`SELECT * FROM posts WHERE id = ?`, [req.params.id]);

  if (!rows || rows.length === 0) {
    return res.status(404).render('404');
  }

  res.render('update-post.ejs', { post: rows[0] });
});

// Save edited post
router.post('/posts/:id/edit', async (req, res) => {
  await db.query(
    `UPDATE posts
     SET title = ?, summary = ?, body = ?
     WHERE id = ?`,
    [
      req.body.title,
      req.body.summary,
      req.body.content,
      req.params.id
    ]
  );

  res.redirect('/posts');
});

// Delete post
router.post('/posts/:id/delete', async (req, res) => {
  await db.query(`DELETE FROM posts WHERE id = ?`, [req.params.id]);
  res.redirect('/posts');
});

module.exports = router;
