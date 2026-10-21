import { describe, expect, it } from 'vitest';
import supertest from 'supertest';
import { app } from '../src/index.js';

const request = supertest(app);

describe('API Integration Tests', () => {
  describe('/health route', () => {
    it('should respond with a healthy response', async () => {
      const res = await request.get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('/articles routes', () => {
    it('should create an article', async () => {
      const res = await request.post('/articles').send({
        title: 'Another article',
        contents: 'This is yet another article',
      });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({
        articleId: expect.any(Number),
        title: 'Another article',
        contents: 'This is yet another article',
      });
      const { articleId } = res.body;
      const getRes = await request.get(`/articles/${articleId}`);
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toEqual({
        articleId,
        title: 'Another article',
        contents: 'This is yet another article',
      });
    });

    it('should update an article', async () => {
      const createRes = await request.post('/articles').send({
        title: 'Article to update',
        contents: 'Original contents',
      });
      expect(createRes.statusCode).toEqual(201);
      const { articleId } = createRes.body;

      const updateRes = await request.put(`/articles/${articleId}`).send({
        title: 'Updated title',
        contents: 'Updated contents',
      });
      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body).toEqual({
        articleId,
        title: 'Updated title',
        contents: 'Updated contents',
      });
    });

    it('should return 404 when updating a non-existent article', async () => {
      const res = await request.put('/articles/999999').send({
        title: 'Ghost article',
      });
      expect(res.statusCode).toEqual(404);
    });

    it('should delete an article', async () => {
      const createRes = await request.post('/articles').send({
        title: 'Article to delete',
        contents: 'Will be deleted',
      });
      expect(createRes.statusCode).toEqual(201);
      const { articleId } = createRes.body;

      const deleteRes = await request.delete(`/articles/${articleId}`);
      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body).toEqual({
        articleId,
        title: 'Article to delete',
        contents: 'Will be deleted',
      });

      const getRes = await request.get(`/articles/${articleId}`);
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 when deleting a non-existent article', async () => {
      const res = await request.delete('/articles/999999');
      expect(res.statusCode).toEqual(404);
    });
  });

  describe('/articles/:articleId/comments routes', () => {
    it('should create and retrieve a comment', async () => {
      const articleRes = await request.post('/articles').send({
        title: 'Article with comments',
        contents: 'Some contents',
      });
      expect(articleRes.statusCode).toEqual(201);
      const { articleId } = articleRes.body;

      const createRes = await request
        .post(`/articles/${articleId}/comments`)
        .send({ body: 'Great article!' });
      expect(createRes.statusCode).toEqual(201);
      expect(createRes.body).toEqual({
        commentId: expect.any(Number),
        articleId,
        body: 'Great article!',
      });

      const { commentId } = createRes.body;
      const getRes = await request.get(
        `/articles/${articleId}/comments/${commentId}`,
      );
      expect(getRes.statusCode).toEqual(200);
      expect(getRes.body).toEqual({ commentId, articleId, body: 'Great article!' });
    });

    it('should list all comments for an article', async () => {
      const articleRes = await request.post('/articles').send({
        title: 'Article for listing comments',
        contents: 'Some contents',
      });
      const { articleId } = articleRes.body;

      await request.post(`/articles/${articleId}/comments`).send({ body: 'First' });
      await request.post(`/articles/${articleId}/comments`).send({ body: 'Second' });

      const listRes = await request.get(`/articles/${articleId}/comments`);
      expect(listRes.statusCode).toEqual(200);
      expect(listRes.body).toHaveLength(2);
    });

    it('should update a comment', async () => {
      const articleRes = await request.post('/articles').send({
        title: 'Article for update comment',
        contents: 'Some contents',
      });
      const { articleId } = articleRes.body;

      const createRes = await request
        .post(`/articles/${articleId}/comments`)
        .send({ body: 'Original body' });
      const { commentId } = createRes.body;

      const updateRes = await request
        .put(`/articles/${articleId}/comments/${commentId}`)
        .send({ body: 'Updated body' });
      expect(updateRes.statusCode).toEqual(200);
      expect(updateRes.body).toEqual({ commentId, articleId, body: 'Updated body' });
    });

    it('should delete a comment', async () => {
      const articleRes = await request.post('/articles').send({
        title: 'Article for delete comment',
        contents: 'Some contents',
      });
      const { articleId } = articleRes.body;

      const createRes = await request
        .post(`/articles/${articleId}/comments`)
        .send({ body: 'To be deleted' });
      const { commentId } = createRes.body;

      const deleteRes = await request.delete(
        `/articles/${articleId}/comments/${commentId}`,
      );
      expect(deleteRes.statusCode).toEqual(200);
      expect(deleteRes.body).toEqual({ commentId, articleId, body: 'To be deleted' });

      const getRes = await request.get(
        `/articles/${articleId}/comments/${commentId}`,
      );
      expect(getRes.statusCode).toEqual(404);
    });

    it('should cascade delete comments when article is deleted', async () => {
      const articleRes = await request.post('/articles').send({
        title: 'Article to cascade delete',
        contents: 'Some contents',
      });
      const { articleId } = articleRes.body;

      const createRes = await request
        .post(`/articles/${articleId}/comments`)
        .send({ body: 'Orphan comment' });
      const { commentId } = createRes.body;

      await request.delete(`/articles/${articleId}`);

      const getRes = await request.get(
        `/articles/${articleId}/comments/${commentId}`,
      );
      expect(getRes.statusCode).toEqual(404);
    });

    it('should return 404 for comments on a non-existent article', async () => {
      const res = await request.get('/articles/999999/comments');
      expect(res.statusCode).toEqual(404);
    });
  });
});
