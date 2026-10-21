import { Generated, Insertable, Selectable, Updateable } from 'kysely';

export type ArticleTable = {
  articleId: Generated<number>;
  title: string;
  contents: string;
};

export type Article = Selectable<ArticleTable>;
export type NewArticle = Insertable<ArticleTable>;
export type UpdateArticle = Updateable<ArticleTable>;

export type CommentTable = {
  commentId: Generated<number>;
  articleId: number;
  body: string;
};

export type Comment = Selectable<CommentTable>;
export type NewComment = Insertable<CommentTable>;
export type UpdateComment = Updateable<CommentTable>;

export type Database = { article: ArticleTable; comment: CommentTable };
