/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Post } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { correctString } from 'src/service/function';
import { Author } from 'src/types/author.dto';
import { Book } from 'src/types/book.dto';
import { ChapterList } from 'src/types/chapterlist.dto';

@Controller('myauth')
export class MyauthController {
  prisma = new PrismaClient();

  @Post('addAuthor')
  async createAuthor(@Body() author: Author) {
    console.log('addAuthor triggered');
    const id = (
      await this.prisma.author.upsert({
        where: { name: author.author },
        create: { name: author.author, route: author.authorRoute },
        update: { name: author.author, route: author.authorRoute },
        select: { id: true },
      })
    ).id;

    return id;
  }

  @Post('addBook')
  async createBook(@Body() book: Book) {
    console.log('addBook triggered', book.bookUrl);
    let ret: { id: number; source: string } | null;
    const categories = book.categories.map((category) => {
      return {
        where: { name: category },
        create: {
          name: category,
          route: category.toLowerCase().replaceAll(' ', '-'),
        },
      };
    });
    const encoder = new TextEncoder();
    const desc = encoder.encode(
      correctString(
        book.description.length > 1
          ? book.description.join('[hereisbreak]')
          : book.description[0],
      ),
    );
    const genres = book.genre.map((e) => {
      return {
        where: { name: e },
        create: { name: e, route: e.toLowerCase().replaceAll(' ', '-') },
      };
    });
    try {
      ret = await this.prisma.book.upsert({
        where: { title: book.title },
        create: {
          bookUrl: book.bookUrl,
          genre: { connectOrCreate: [...genres] },
          imageUrl: book.imageUrl,
          isHot: book.isHot,
          urlShrink: book.bookUrl.replaceAll('-', ''),
          status: book.status,
          title: book.title,
          totalStars: book.totalStars,
          userrated: book.userrated,
          views: book.views,
          aspectRatio: book.aspectRatio,
          description: desc,
          category: {
            connectOrCreate: [...categories],
          },
          author: { connect: { id: book.authId } },
          ratings:
            book.userrated > 0
              ? new Decimal(book.totalStars / book.userrated)
              : 0,
          source: book.source,
        },
        update: { isHot: book.isHot, source: book.source },
        select: { id: true, source: true },
      });
    } catch (err) {
      console.log(err);
      ret = await this.prisma.book
        .findFirst({
          where: { urlShrink: book.bookUrl.replaceAll('-', '') },
          select: { id: true, source: true },
        })
        .catch((r) => null);
    }
    return ret;
  }

  @Post('getTotalChapter')
  async totalChapters(@Body() bk: { book: string }) {
    console.log('getTotalChapter triggered');
    let ret: number;
    try {
      ret = await this.prisma.book
        .findFirst({
          where: { bookUrl: bk.book },
          select: {
            chapter: {
              orderBy: { number: 'desc' },
              take: 1,
              select: { number: true },
            },
          },
        })
        .then((data) => data!.chapter[0].number);
    } catch (error) {
      ret = 0;
    }
    return ret;
  }

  @Post('checkChapterAvailable')
  async check(@Body() chapters: ChapterList) {
    console.log('checkChapterAvailable triggered');
    const final: Array<{ ch: string; num: number; bookId: number }> = [];
    for (const element of chapters.chapter) {
      const status = await this.prisma.chapter.findFirst({
        where: {
          book: { bookUrl: chapters.book },
          number: element.num,
        },
        select: { id: true },
      });
      if (status === null) {
        final.push(element);
      }
    }
    return final;
  }
  @Post('newRecents')
  async updateRecents(@Body() recent: { bookId: number; chNum: number }) {
    const ret = await this.prisma.recents
      .upsert({
        where: { bookId: recent.bookId },
        create: { bookId: recent.bookId, number: recent.chNum },
        update: { number: recent.chNum },
        select: { id: true },
      })
      .then((data) => (data.id ? 'Success' : 'Failed'));
    return ret;
  }
}
