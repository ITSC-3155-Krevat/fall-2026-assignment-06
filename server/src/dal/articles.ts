import { db } from '../db/db.js';
import { Article, NewArticle, UpdateArticle } from '../db/types.js';

export async function getAllArticles(
  opts: { titleContains?: string } = {},
): Promise<Article[]> {
  let query = db.selectFrom('article').selectAll();
  if (opts.titleContains) {
    query = query.where('title', 'ilike', `%${opts.titleContains}%`);
  }
  const articles = await query.execute();
  return articles;
}

export async function getSingleArticle(
  id: number,
): Promise<Article | undefined> {
  const articleMaybe = await db
    .selectFrom('article')
    .selectAll()
    .where('articleId', '=', id)
    .executeTakeFirst();
  return articleMaybe;
}

export async function createArticle(newArticle: NewArticle): Promise<Article> {
  const article = await db
    .insertInto('article')
    .values(newArticle)
    .returningAll()
    .executeTakeFirstOrThrow();
  return article;
}

export async function updateArticle(
  id: number,
  updates: UpdateArticle,
): Promise<Article | undefined> {
  const article = await db
    .updateTable('article')
    .set(updates)
    .where('articleId', '=', id)
    .returningAll()
    .executeTakeFirst();
  return article;
}

export async function deleteArticle(id: number): Promise<Article | undefined> {
  const article = await db
    .deleteFrom('article')
    .where('articleId', '=', id)
    .returningAll()
    .executeTakeFirst();
  return article;
}
