class FollowUserUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(followerId, followedUsername) {
    const followedUser = await this._userRepository.getUserByUsername(followedUsername);

    if (followerId === followedUser.id) {
      throw new Error('FOLLOW_USER.CANNOT_FOLLOW_SELF');
    }

    await this._userRepository.followUser(followerId, followedUser.id);
  }
}

module.exports = FollowUserUseCase;
