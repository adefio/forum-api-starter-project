const AddUserUseCase = require('../../../../Applications/use_case/AddUserUseCase');
const GetUserProfileUseCase = require('../../../../Applications/use_case/GetUserProfileUseCase');
const GetUsersUseCase = require('../../../../Applications/use_case/GetUsersUseCase');
const FollowUserUseCase = require('../../../../Applications/use_case/FollowUserUseCase');
const UnfollowUserUseCase = require('../../../../Applications/use_case/UnfollowUserUseCase');
const GetUserFollowersUseCase = require('../../../../Applications/use_case/GetUserFollowersUseCase');
const GetUserFollowingUseCase = require('../../../../Applications/use_case/GetUserFollowingUseCase');

class UsersHandler {
  constructor(container) {
    this._container = container;

    this.postUserHandler = this.postUserHandler.bind(this);
    this.getUsersHandler = this.getUsersHandler.bind(this);
    this.getUserProfileHandler = this.getUserProfileHandler.bind(this);
    this.postFollowHandler = this.postFollowHandler.bind(this);
    this.deleteFollowHandler = this.deleteFollowHandler.bind(this);
    this.getFollowersHandler = this.getFollowersHandler.bind(this);
    this.getFollowingHandler = this.getFollowingHandler.bind(this);
  }

  async postUserHandler(req, res, next) {
    try {
      const addUserUseCase = this._container.getInstance(AddUserUseCase.name);
      const addedUser = await addUserUseCase.execute(req.body);

      res.status(201).json({
        status: 'success',
        data: {
          addedUser,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUsersHandler(req, res, next) {
    try {
      const getUsersUseCase = this._container.getInstance(GetUsersUseCase.name);
      const users = await getUsersUseCase.execute(req.query.q, req.auth?.id);

      res.status(200).json({
        status: 'success',
        data: {
          users,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserProfileHandler(req, res, next) {
    try {
      const getUserProfileUseCase = this._container.getInstance(GetUserProfileUseCase.name);
      const { username } = req.params;

      const profile = await getUserProfileUseCase.execute(username, req.auth?.id);

      res.status(200).json({
        status: 'success',
        data: {
          profile,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async postFollowHandler(req, res, next) {
    try {
      const followUserUseCase = this._container.getInstance(FollowUserUseCase.name);
      const { id: credentialId } = req.auth;
      const { username } = req.params;

      await followUserUseCase.execute(credentialId, username);

      res.status(201).json({
        status: 'success',
        data: {
          followedUsername: username,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteFollowHandler(req, res, next) {
    try {
      const unfollowUserUseCase = this._container.getInstance(UnfollowUserUseCase.name);
      const { id: credentialId } = req.auth;
      const { username } = req.params;

      await unfollowUserUseCase.execute(credentialId, username);

      res.status(200).json({
        status: 'success',
        data: {
          unfollowedUsername: username,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowersHandler(req, res, next) {
    try {
      const getUserFollowersUseCase = this._container.getInstance(GetUserFollowersUseCase.name);
      const { username } = req.params;

      const followers = await getUserFollowersUseCase.execute(username, req.auth?.id);

      res.status(200).json({
        status: 'success',
        data: {
          followers,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getFollowingHandler(req, res, next) {
    try {
      const getUserFollowingUseCase = this._container.getInstance(GetUserFollowingUseCase.name);
      const { username } = req.params;

      const following = await getUserFollowingUseCase.execute(username, req.auth?.id);

      res.status(200).json({
        status: 'success',
        data: {
          following,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UsersHandler;
