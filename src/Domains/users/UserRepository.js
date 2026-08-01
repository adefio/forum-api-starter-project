class UserRepository {
  async addUser(registerUser) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async verifyAvailableUsername(username) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getPasswordByUsername(username) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getIdByUsername(username) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getProfileByUsername(username, currentUserId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getUserByUsername(username) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async followUser(followerId, followedId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async unfollowUser(followerId, followedId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getUsers(query, currentUserId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getFollowers(username, currentUserId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getFollowing(username, currentUserId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async findById(userId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getSettings(userId) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async updateSettings(userId, settings) {
    throw new Error('USER_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = UserRepository;
