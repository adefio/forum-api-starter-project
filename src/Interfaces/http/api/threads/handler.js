const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetThreadDetailUseCase = require('../../../../Applications/use_case/GetThreadDetailUseCase');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
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

  async getThreadHandler(req, res, next) {
    try {
      const getThreadDetailUseCase = this._container.getInstance(GetThreadDetailUseCase.name);
      const { threadId } = req.params;

      const thread = await getThreadDetailUseCase.execute(threadId);

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