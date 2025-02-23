import { Test, TestingModule } from '@nestjs/testing';
import { MyauthController } from './myauth.controller';

describe('MyauthController', () => {
  let controller: MyauthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyauthController],
    }).compile();

    controller = module.get<MyauthController>(MyauthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
