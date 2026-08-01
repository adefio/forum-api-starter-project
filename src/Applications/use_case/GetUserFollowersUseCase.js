class GetUserFollowersUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(username, currentUserId) {
    return this._userRepository.getFollowers(username, currentUserId);
  }
}

module.exports = GetUserFollowersUseCase;
