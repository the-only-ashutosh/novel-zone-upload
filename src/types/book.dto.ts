import { Decimal } from '@prisma/client/runtime/library';

export class Book {
  bookUrl: string;
  title: string;
  author: string;
  genre: Array<string>;
  status: string;
  categories: Array<string>;
  description: Array<string>;
  isHot: boolean;
  userrated: number;
  totalStars: number;
  imageUrl: string;
  views: number;
  authId: number;
  aspectRatio: Decimal;
  source: string;
}
