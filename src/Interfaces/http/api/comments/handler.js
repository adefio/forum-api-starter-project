const autoBind = require('auto-bind');
const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');
const LikeCommentUseCase = require('../../../../Applications/use_case/LikeCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postCommentHandler(req, res, next) {
    try {
      const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);
      const { threadId } = req.params;
      const { id: credentialId } = req.auth;

      const addedComment = await addCommentUseCase.execute(req.body, threadId, credentialId);

      res.status(201).json({
        status: 'success',
        data: { addedComment },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCommentHandler(req, res, next) {
    try {
      const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);
      const { threadId, commentId } = req.params;
      const { id: credentialId } = req.auth;

      await deleteCommentUseCase.execute(threadId, commentId, credentialId);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }

  async putLikeCommentHandler(req, res, next) {
    try {
      const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
      const { threadId, commentId } = req.params;
      const { id: credentialId } = req.auth;

      await likeCommentUseCase.execute(threadId, commentId, credentialId);

      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CommentsHandler;