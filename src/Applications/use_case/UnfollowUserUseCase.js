class UnfollowUserUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(followerId, followedUsername) {
    const followedUser = await this._userRepository.getUserByUsername(followedUsername);

    if (followerId === followedUser.id) {
      throw new Error('UNFOLLOW_USER.CANNOT_UNFOLLOW_SELF');
    }

    await this._userRepository.unfollowUser(followerId, followedUser.id);
  }
}

module.exports = UnfollowUserUseCase;
