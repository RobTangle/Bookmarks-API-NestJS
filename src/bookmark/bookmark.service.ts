import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    const newBookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return newBookmark;
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    return bookmark;
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resourse denied.');
    }
    return this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    const bookmarkToDelete = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmarkToDelete || bookmarkToDelete.userId !== userId) {
      throw new ForbiddenException('Access to resourse denied.');
    }

    return this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });
  }

  getBookmarks(userId: number) {
    return this.prisma.bookmark.findMany({
      where: { userId: userId },
    });
  }
}
