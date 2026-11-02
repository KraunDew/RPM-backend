import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { IAService } from 'src/services/ia.service';

@Controller('/ia')
export class IAController {
  constructor(private readonly iaService: IAService) {}

  @Post('/chat')
  async askAssistant(
    @Body('message') message: string,
    @Body('conversationId') conversationId?: string,
  ) {
    if (typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacío.');
    }

    return this.iaService.askAssistant(message.trim(), null, conversationId);
  }
}
