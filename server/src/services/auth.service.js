import bcrypt from "bcrypt";
import { prisma } from "../config/prisma.js";
import { signToken } from "../utils/jwt.js";

const SALT_ROUNDS = 10;

export class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function getSubscriptionActive(userId) {
  const activeSubscription = await prisma.subscription.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  return activeSubscription !== null;
}

function buildTokenPayload(user, subscriptionActive) {
  return {
    userId: user.id,
    role: user.role,
    subscriptionActive,
  };
}

export async function signup({ email, password, fullName }) {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AuthError("An account with this email already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, passwordHash, fullName },
  });

  const token = signToken(buildTokenPayload(user, false));

  return { token, user };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AuthError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw new AuthError("Invalid email or password", 401);
  }

  const subscriptionActive = await getSubscriptionActive(user.id);
  const token = signToken(buildTokenPayload(user, subscriptionActive));

  return { token, user };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("User not found", 404);
  }
  return user;
}
