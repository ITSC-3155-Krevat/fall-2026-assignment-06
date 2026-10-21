import express from 'express';
import cors from 'cors';
import {
  getAllArticles,
  getSingleArticle,
  createArticle,
  updateArticle,
  deleteArticle,
} from './dal/articles.js';
import {
  getCommentsByArticle,
  getSingleComment,
  createComment,
  updateComment,
  deleteComment,
} from './dal/comments.js';
import { Article, Comment } from './db/types.js';

export const app = express();

app.use(express.json());
app.use(cors());

app.get('/health', function (_, res) {
  res.json({ status: 'ok' });
});

// --- Helper to parse and validate numeric route params ---
function parseId(
  raw: string,
  name: string,
  res: express.Response,
): number | null {
  const num = +raw;
  if (Number.isNaN(num)) {
    res.status(400).json({ error: `${name} must be a number` });
    return null;
  }
  return num;
}

app.get('/articles', async function (req, res) {
  const titleContains = req.query.title_contains;
  const articles = await getAllArticles({
    titleContains: titleContains ? '' + titleContains : undefined,
  });
  return res.json(articles);
});

app.get('/articles/:articleId', async function (req, res) {
  const articleId = parseId(req.params.articleId, 'articleId', res);
  if (articleId === null) return;
  const article = await getSingleArticle(articleId);
  if (!article) {
    return res.status(404).json({ error: 'article not found' });
  }
  return res.json(article);
});

app.post('/articles', async function (req, res) {
  const article = req.body as Partial<Omit<Article, 'articleId'>>;
  if (!article.contents || !article.title) {
    return res.sendStatus(400);
  }
  const { contents, title } = article;
  const newArticle = await createArticle({ title, contents });
  res.status(201).json(newArticle);
});

app.put('/articles/:articleId', async function (req, res) {
  const articleId = parseId(req.params.articleId, 'articleId', res);
  if (articleId === null) return;
  const updates = req.body as Partial<Omit<Article, 'articleId'>>;
  if (!updates.title && !updates.contents) {
    return res
      .status(400)
      .json({ error: 'At least one of title or contents must be provided' });
  }
  const updated = await updateArticle(articleId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'article not found' });
  }
  return res.json(updated);
});

app.delete('/articles/:articleId', async function (req, res) {
  const articleId = parseId(req.params.articleId, 'articleId', res);
  if (articleId === null) return;
  const deleted = await deleteArticle(articleId);
  if (!deleted) {
    return res.status(404).json({ error: 'article not found' });
  }
  return res.json(deleted);
});

// --- Comments routes ---

app.get('/articles/:articleId/comments', async function (req, res) {
  const articleId = parseId(req.params.articleId, 'articleId', res);
  if (articleId === null) return;
  const article = await getSingleArticle(articleId);
  if (!article) {
    return res.status(404).json({ error: 'article not found' });
  }
  const comments = await getCommentsByArticle(articleId);
  return res.json(comments);
});

app.get(
  '/articles/:articleId/comments/:commentId',
  async function (req, res) {
    const articleId = parseId(req.params.articleId, 'articleId', res);
    if (articleId === null) return;
    const commentId = parseId(req.params.commentId, 'commentId', res);
    if (commentId === null) return;
    const comment = await getSingleComment(commentId, articleId);
    if (!comment) {
      return res.status(404).json({ error: 'comment not found' });
    }
    return res.json(comment);
  },
);

app.post('/articles/:articleId/comments', async function (req, res) {
  const articleId = parseId(req.params.articleId, 'articleId', res);
  if (articleId === null) return;
  const article = await getSingleArticle(articleId);
  if (!article) {
    return res.status(404).json({ error: 'article not found' });
  }
  const body = req.body as Partial<Omit<Comment, 'commentId' | 'articleId'>>;
  if (!body.body) {
    return res.status(400).json({ error: 'body is required' });
  }
  const newComment = await createComment({ articleId, body: body.body });
  return res.status(201).json(newComment);
});

app.put(
  '/articles/:articleId/comments/:commentId',
  async function (req, res) {
    const articleId = parseId(req.params.articleId, 'articleId', res);
    if (articleId === null) return;
    const commentId = parseId(req.params.commentId, 'commentId', res);
    if (commentId === null) return;
    const updates = req.body as Partial<
      Omit<Comment, 'commentId' | 'articleId'>
    >;
    if (!updates.body) {
      return res.status(400).json({ error: 'body is required' });
    }
    const updated = await updateComment(commentId, articleId, updates);
    if (!updated) {
      return res.status(404).json({ error: 'comment not found' });
    }
    return res.json(updated);
  },
);

app.delete(
  '/articles/:articleId/comments/:commentId',
  async function (req, res) {
    const articleId = parseId(req.params.articleId, 'articleId', res);
    if (articleId === null) return;
    const commentId = parseId(req.params.commentId, 'commentId', res);
    if (commentId === null) return;
    const deleted = await deleteComment(commentId, articleId);
    if (!deleted) {
      return res.status(404).json({ error: 'comment not found' });
    }
    return res.json(deleted);
  },
);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  },
);

if (process.env.NODE_ENV !== 'test') {
  app.listen(8080, () => console.log('Service started on 8080'));
}
