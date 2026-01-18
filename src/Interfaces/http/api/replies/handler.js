// src/Interfaces/http/api/replies/handler.js
const autoBind = require('auto-bind');
const AddReplyUseCase = require('../../../../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../../../../Applications/use_case/DeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;
    autoBind(this);
  }

  async postReplyHandler(req, res, next) {
    try {
      const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);
      const { threadId, commentId } = req.params;
      const { id: credentialId } = req.auth;

      const addedReply = await addReplyUseCase.execute(req.body, threadId, commentId, credentialId);

      res.status(201).json({
        status: 'success',
        data: { addedReply },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteReplyHandler(req, res, next) {
    try {
      const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);
      const { threadId, commentId, replyId } = req.params;
      const { id: credentialId } = req.auth;

      await deleteReplyUseCase.execute(threadId, commentId, replyId, credentialId);

       res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  }
}


module.exports = RepliesHandler;