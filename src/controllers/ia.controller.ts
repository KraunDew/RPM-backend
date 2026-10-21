import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtGuard } from 'src/guards/jwt.guard';
import { IAService } from 'src/services/ia.service';

type AuthenticatedRequest = Request & {
  user: {
    id?: string;
    email?: string;
  };
};

@Controller('/ia')
@UseGuards(JwtGuard)
export class IAController {
  constructor(private readonly iaService: IAService) {}

  @Post('/chat')
  async askAssistant(
    @Body('message') message: string,
    @Body('conversationId') conversationId: string | undefined,
    @Req() request: AuthenticatedRequest,
  ) {
    if (typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException('El mensaje no puede estar vacío.');
    }

    const userId = request.user?.id;

    if (!userId) {
      throw new BadRequestException(
        'No se pudo identificar al usuario autenticado.',
      );
    }

    return this.iaService.askAssistant(message.trim(), userId, conversationId);
  }
}
