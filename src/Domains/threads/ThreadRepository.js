class ThreadRepository {
  async addThread(newThread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadAvailability(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadOwner(threadId, owner) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getThreadById(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getAllThreads() {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addThreadLike(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteThreadLike(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkIsThreadLiked(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getThreadLikeCount(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async addBookmark(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteBookmark(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async checkIsThreadBookmarked(userId, threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyThreadOwner(threadId, owner) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getOwnerByThreadId(threadId) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async editThread(threadId, newThread) {
    throw new Error('THREAD_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = ThreadRepository;