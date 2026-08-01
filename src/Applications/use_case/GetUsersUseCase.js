class GetUsersUseCase {
  constructor({ userRepository }) {
    this._userRepository = userRepository;
  }

  async execute(query, currentUserId) {
    return this._userRepository.getUsers(query, currentUserId);
  }
}

module.exports = GetUsersUseCase;
