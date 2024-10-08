import type { Prisma, PrismaClient, User } from "@prisma/client";
import { env } from "../../../../../config/env";
import { DatabaseConnection } from "../../../../../infra/database/GetConnection";
import type { IUserRepository } from "../../../repositories/IUserRepository";

export class UserRepository implements IUserRepository {
  private prismaClient: PrismaClient;

  private constructor() {
    this.prismaClient = DatabaseConnection.getInstance();
  }

  async delete(id: string): Promise<void> {
    await this.prismaClient.user.delete({
      where: {
        id,
      },
    });
  }

  private static INSTANCE: UserRepository | null;
  static getInstance(): UserRepository {
    if (!UserRepository.INSTANCE) {
      UserRepository.INSTANCE = new UserRepository();
    }

    return UserRepository.INSTANCE;
  }

  async create(userDTO: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prismaClient.user.create({
      data: userDTO,
    });

    if (user.iconUrl) {
      user.iconUrl = `${env.BASE_URL}/user/avatar/${encodeURI(user.iconUrl)}`;
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prismaClient.user.findFirst({
      where: {
        email,
      },
    });

    if (user?.iconUrl) {
      user.iconUrl = `${env.BASE_URL}/user/avatar/${encodeURI(user.iconUrl)}`;
    }

    return user;
  }

  async findOneById(id: string): Promise<User | null> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id,
      },
      include: {
        playlists: {
          include: {
            musics: true,
          },
        },
      },
    });

    if (user?.iconUrl) {
      user.iconUrl = `${env.BASE_URL}/user/avatar/${encodeURI(user.iconUrl)}`;
    }

    return user;
  }

  async update(user: User): Promise<User> {
    // @ts-ignore
    user.playlists = undefined;

    const updatedUser = await this.prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });

    if (user?.iconUrl) {
      user.iconUrl = `${env.BASE_URL}/user/avatar/${encodeURI(user.iconUrl)}`;
    }

    return updatedUser;
  }

  async followingUser(user_id: string, following_id: string): Promise<void> {
    await this.prismaClient.user.update({
      where: {
        id: user_id,
      },
      data: {
        following: {
          connect: {
            id: following_id,
          },
        },
      },
    });
  }

  public async unfollowingUser(user_id: string, following_id: string): Promise<void> {
    await this.prismaClient.user.update({
      where: {
        id: user_id,
      },
      data: {
        following: {
          disconnect: {
            id: following_id,
          },
        },
      },
    });
  }

  public async isFollowing(user_id: string, following_id: string): Promise<boolean> {
    const user = await this.prismaClient.user.findUnique({
      where: {
        id: user_id,
      },
      include: {
        following: true,
      },
    });

    if (!user) {
      return false;
    }

    return user.following.some((following) => following.id === following_id);
  }

  public async searchByName(name: string): Promise<User[]> {
    const users = await this.prismaClient.user.findMany({
      where: {
        name: {
          contains: name,
        },
      },
    });

    return users.map((user) => {
      if (user?.iconUrl) {
        user.iconUrl = `${env.BASE_URL}/user/avatar/${encodeURI(user.iconUrl)}`;
      }

      // @ts-ignore
      user.password = undefined;
      return user;
    });
  }
}
