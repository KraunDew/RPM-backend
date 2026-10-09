import { Body, Controller, Post } from '@nestjs/common';
import { IAService } from 'src/services/ia.service';

@Controller('/ia')
export class IAController {
  constructor(private iaService: IAService) {}
  @Post('/chat')
  async askAssistant(@Body('message') message: string) {
    return await this.iaService.askAssistant(message);
  }
}
