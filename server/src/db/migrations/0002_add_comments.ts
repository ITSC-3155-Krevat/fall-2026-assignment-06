/* eslint-disable @typescript-eslint/no-explicit-any */
import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable('comment')
    .addColumn('commentId', 'serial', (col) => col.primaryKey())
    .addColumn('articleId', 'integer', (col) =>
      col.notNull().references('article.articleId').onDelete('cascade'),
    )
    .addColumn('body', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable('comment').execute();
}
