import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyauthController } from './myauth/myauth.controller';

@Module({
  imports: [],
  controllers: [AppController, MyauthController],
  providers: [AppService],
})
export class AppModule {}
