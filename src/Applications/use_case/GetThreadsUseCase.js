class GetThreadsUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(userId = null, filters = {}) {
    return this._threadRepository.getAllThreads(userId, filters);
  }
}

module.exports = GetThreadsUseCase;
