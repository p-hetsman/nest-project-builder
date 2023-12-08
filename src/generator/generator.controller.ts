import { Controller, Post, Body, HttpCode } from '@nestjs/common';

import { GenerateDto } from './dtos/generate.dto';
import { GeneratorService } from './generator.service';

@Controller('generator')
export class GeneratorController {
  constructor(private readonly generatorService: GeneratorService) {}

  @HttpCode(200)
  @Post('generate')
  async generate(@Body() body: GenerateDto) {
    return this.generatorService.generate(body);
  }
}
