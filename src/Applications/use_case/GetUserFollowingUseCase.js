class GetUserFollowingUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(username, currentUserId) {
    return this._userRepository.getFollowing(username, currentUserId);
  }
}

module.exports = GetUserFollowingUseCase;
