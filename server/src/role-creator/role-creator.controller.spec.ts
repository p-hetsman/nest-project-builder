import { Test, TestingModule } from '@nestjs/testing';
import { RoleCreatorController } from './role-creator.controller';

describe('RoleCreatorController', () => {
  let controller: RoleCreatorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleCreatorController],
    }).compile();

    controller = module.get<RoleCreatorController>(RoleCreatorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
