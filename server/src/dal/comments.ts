import { db } from '../db/db.js';
import { Comment, NewComment, UpdateComment } from '../db/types.js';

export async function getCommentsByArticle(
  articleId: number,
): Promise<Comment[]> {
  const comments = await db
    .selectFrom('comment')
    .selectAll()
    .where('articleId', '=', articleId)
    .execute();
  return comments;
}

export async function getSingleComment(
  commentId: number,
  articleId: number,
): Promise<Comment | undefined> {
  const comment = await db
    .selectFrom('comment')
    .selectAll()
    .where('commentId', '=', commentId)
    .where('articleId', '=', articleId)
    .executeTakeFirst();
  return comment;
}

export async function createComment(newComment: NewComment): Promise<Comment> {
  const comment = await db
    .insertInto('comment')
    .values(newComment)
    .returningAll()
    .executeTakeFirstOrThrow();
  return comment;
}

export async function updateComment(
  commentId: number,
  articleId: number,
  updates: UpdateComment,
): Promise<Comment | undefined> {
  const comment = await db
    .updateTable('comment')
    .set(updates)
    .where('commentId', '=', commentId)
    .where('articleId', '=', articleId)
    .returningAll()
    .executeTakeFirst();
  return comment;
}

export async function deleteComment(
  commentId: number,
  articleId: number,
): Promise<Comment | undefined> {
  const comment = await db
    .deleteFrom('comment')
    .where('commentId', '=', commentId)
    .where('articleId', '=', articleId)
    .returningAll()
    .executeTakeFirst();
  return comment;
}
