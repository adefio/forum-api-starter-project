/* src/Infrastructures/container.js */
const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const { Redis } = require('@upstash/redis');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepository = require('../Domains/users/UserRepository');
const PasswordHash = require('../Applications/security/PasswordHash');
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const BcryptPasswordHash = require('./security/BcryptPasswordHash');
const ThreadRepository = require('../Domains/threads/ThreadRepository');
const ThreadRepositoryPostgres = require('./repository/ThreadRepositoryPostgres');
const CommentRepository = require('../Domains/comments/CommentRepository');
const CommentRepositoryPostgres = require('./repository/CommentRepositoryPostgres');
const ReplyRepository = require('../Domains/replies/ReplyRepository');
const ReplyRepositoryPostgres = require('./repository/ReplyRepositoryPostgres');
const AuthenticationTokenManager = require('../Applications/security/AuthenticationTokenManager');
const JwtTokenManager = require('./security/JwtTokenManager');
const AuthenticationRepository = require('../Domains/authentications/AuthenticationRepository');
const AuthenticationRepositoryPostgres = require('./repository/AuthenticationRepositoryPostgres');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const LoginUserUseCase = require('../Applications/use_case/LoginUserUseCase');
const LogoutUserUseCase = require('../Applications/use_case/LogoutUserUseCase');
const RefreshAuthenticationUseCase = require('../Applications/use_case/RefreshAuthenticationUseCase');
const AddThreadUseCase = require('../Applications/use_case/AddThreadUseCase');
const GetThreadDetailUseCase = require('../Applications/use_case/GetThreadDetailUseCase');
const AddCommentUseCase = require('../Applications/use_case/AddCommentUseCase');
const DeleteCommentUseCase = require('../Applications/use_case/DeleteCommentUseCase');
const LikeCommentUseCase = require('../Applications/use_case/LikeCommentUseCase');
const AddReplyUseCase = require('../Applications/use_case/AddReplyUseCase');
const DeleteReplyUseCase = require('../Applications/use_case/DeleteReplyUseCase');

/**
 * 1. FUNGSI WRAPPER (The Fix)
 * Memastikan interface seragam antara Upstash (REST) dan Mock (Lokal).
 */
const wrapRedis = (client) => ({
  sendCommand: async (command, ...args) => {
    // Logika untuk Upstash Redis REST (Production)
    if (typeof client.call === 'function' && !client.sendCommand) {
      return client.call([command, ...args]);
    }
    // Logika untuk Mock/Standard Redis (Test/Local)
    return client.sendCommand(command, ...args);
  },
});

/**
 * 2. INISIALISASI INSTANCE REDIS
 */
const getRedisInstance = () => {
  const smartMock = {
    sendCommand: async (command) => {
      if (typeof command === 'string' && command.toLowerCase() === 'script') {
        return 'dummy_sha_hash';
      }
      return [1, 100];
    },
  };

  // Gunakan Upstash hanya jika di Production dan Env tersedia
  if (process.env.NODE_ENV === 'production' && process.env.UPSTASH_REDIS_REST_URL) {
    const upstash = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return wrapRedis(upstash);
  }

  // Fallback: Test atau Local Development
  return wrapRedis(smartMock);
};

const redisInstance = getRedisInstance();
const container = createContainer();

// Registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
  {
    key: AuthenticationRepository.name,
    Class: AuthenticationRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }],
    },
  },
  {
    key: PasswordHash.name,
    Class: BcryptPasswordHash,
    parameter: {
      dependencies: [{ concrete: bcrypt }],
    },
  },
  {
    key: AuthenticationTokenManager.name,
    Class: JwtTokenManager,
  },
  {
    key: 'Redis',
    Class: function() { return redisInstance; },
  },
  {
    key: ThreadRepository.name,
    Class: ThreadRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
  {
    key: CommentRepository.name,
    Class: CommentRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
  {
    key: ReplyRepository.name,
    Class: ReplyRepositoryPostgres,
    parameter: {
      dependencies: [{ concrete: pool }, { concrete: nanoid }],
    },
  },
]);

// Registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'userRepository', internal: UserRepository.name },
        { name: 'passwordHash', internal: PasswordHash.name },
      ],
    },
  },
  {
    key: LoginUserUseCase.name,
    Class: LoginUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'userRepository', internal: UserRepository.name },
        { name: 'authenticationRepository', internal: AuthenticationRepository.name },
        { name: 'authenticationTokenManager', internal: AuthenticationTokenManager.name },
        { name: 'passwordHash', internal: PasswordHash.name },
      ],
    },
  },
  {
    key: LogoutUserUseCase.name,
    Class: LogoutUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'authenticationRepository', internal: AuthenticationRepository.name },
      ],
    },
  },
  {
    key: RefreshAuthenticationUseCase.name,
    Class: RefreshAuthenticationUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'authenticationRepository', internal: AuthenticationRepository.name },
        { name: 'authenticationTokenManager', internal: AuthenticationTokenManager.name },
      ],
    },
  },
  {
    key: AddThreadUseCase.name,
    Class: AddThreadUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [{ name: 'threadRepository', internal: ThreadRepository.name }],
    },
  },
  {
    key: GetThreadDetailUseCase.name,
    Class: GetThreadDetailUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'replyRepository', internal: ReplyRepository.name },
      ],
    },
  },
  {
    key: AddCommentUseCase.name,
    Class: AddCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'threadRepository', internal: ThreadRepository.name },
      ],
    },
  },
  {
    key: DeleteCommentUseCase.name,
    Class: DeleteCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'threadRepository', internal: ThreadRepository.name },
      ],
    },
  },
  {
    key: AddReplyUseCase.name,
    Class: AddReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'replyRepository', internal: ReplyRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'threadRepository', internal: ThreadRepository.name },
      ],
    },
  },
  {
    key: DeleteReplyUseCase.name,
    Class: DeleteReplyUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'replyRepository', internal: ReplyRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
        { name: 'threadRepository', internal: ThreadRepository.name },
      ],
    },
  },
  {
    key: LikeCommentUseCase.name,
    Class: LikeCommentUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        { name: 'threadRepository', internal: ThreadRepository.name },
        { name: 'commentRepository', internal: CommentRepository.name },
      ],
    },
  },
]);

module.exports = container;