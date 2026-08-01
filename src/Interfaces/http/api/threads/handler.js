const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadsUseCase = require('../../../../Applications/use_case/GetThreadsUseCase');
const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');
const ToggleThreadLikeUseCase = require('../../../../Applications/use_case/ToggleThreadLikeUseCase');
const ToggleBookmarkUseCase = require('../../../../Applications/use_case/ToggleBookmarkUseCase');
const EditThreadUseCase = require('../../../../Applications/use_case/EditThreadUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadsHandler = this.getThreadsHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
    this.putThreadLikeHandler = this.putThreadLikeHandler.bind(this);
    this.putBookmarkHandler = this.putBookmarkHandler.bind(this);
    this.putThreadHandler = this.putThreadHandler.bind(this);
  }

  async postThreadHandler(req, res, next) {
    try {
      const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
      const { id: credentialId } = req.auth;

      const addedThread = await addThreadUseCase.execute(req.body, credentialId);

      res.status(201).json({
        status: 'success',
        data: {
          addedThread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadsHandler(req, res, next) {
    try {
      const getThreadsUseCase = this._container.getInstance(GetThreadsUseCase.name);

      const threads = await getThreadsUseCase.execute(req.auth?.id, {
        q: req.query.q,
        type: req.query.type,
      });

      res.status(200).json({
        status: 'success',
        data: {
          threads,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getThreadHandler(req, res, next) {
    try {
      const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
      const { threadId } = req.params;

      const thread = await getThreadDetailUseCase.execute(threadId, req.auth?.id);

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async putThreadLikeHandler(req, res, next) {
    try {
      const toggleThreadLikeUseCase = this._container.getInstance(ToggleThreadLikeUseCase.name);
      const { threadId } = req.params;
      const { id: credentialId } = req.auth;

      const result = await toggleThreadLikeUseCase.execute({ threadId, credentialId });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async putBookmarkHandler(req, res, next) {
    try {
      const toggleBookmarkUseCase = this._container.getInstance(ToggleBookmarkUseCase.name);
      const { threadId } = req.params;
      const { id: credentialId } = req.auth;

      const result = await toggleBookmarkUseCase.execute({ threadId, credentialId });

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async putThreadHandler(req, res, next) {
    try {
      const editThreadUseCase = this._container.getInstance(EditThreadUseCase.name);
      const { threadId } = req.params;
      const { id: credentialId } = req.auth;

      const thread = await editThreadUseCase.execute(threadId, req.body, credentialId);

      res.status(200).json({
        status: 'success',
        data: {
          thread,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ThreadsHandler;
