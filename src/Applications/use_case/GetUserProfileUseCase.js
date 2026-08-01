class GetUserProfileUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(username, currentUserId) {
    return this._userRepository.getProfileByUsername(username, currentUserId);
  }
}

module.exports = GetUserProfileUseCase;
