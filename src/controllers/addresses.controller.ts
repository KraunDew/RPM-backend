import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateAddressDto } from 'src/dto/create-address.dto';
import { UpdateAddressDto } from 'src/dto/update-address.dto';
import { JwtGuard } from 'src/guards/jwt.guard';
import { AddressesService } from 'src/services/addresses.service';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('/addresses')
@UseGuards(JwtGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  getMyAddresses(@Req() req: AuthenticatedRequest) {
    return this.addressesService.getForUser(this.getUserId(req));
  }

  @Post()
  createAddress(
    @Req() req: AuthenticatedRequest,
    @Body() data: CreateAddressDto,
  ) {
    return this.addressesService.createForUser(this.getUserId(req), data);
  }

  @Patch('/:id')
  updateAddress(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: UpdateAddressDto,
  ) {
    return this.addressesService.updateForUser(this.getUserId(req), id, data);
  }

  @Delete('/:id')
  deleteAddress(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.addressesService.deleteForUser(this.getUserId(req), id);
  }

  private getUserId(req: AuthenticatedRequest) {
    if (!req.user?.id) {
      throw new BadRequestException('No se pudo identificar al usuario');
    }

    return req.user.id;
  }
}
