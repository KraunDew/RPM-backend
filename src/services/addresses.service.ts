import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from 'src/dto/create-address.dto';
import { UpdateAddressDto } from 'src/dto/update-address.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  getForUser(id_user: string) {
    return this.prisma.address.findMany({
      where: { id_user },
      orderBy: { id_address: 'asc' },
    });
  }

  createForUser(id_user: string, data: CreateAddressDto) {
    return this.prisma.address.create({
      data: {
        ...data,
        id_user,
      },
    });
  }

  async updateForUser(
    id_user: string,
    id_address: string,
    data: UpdateAddressDto,
  ) {
    await this.ensureOwnedByUser(id_user, id_address);

    return this.prisma.address.update({
      where: { id_address },
      data,
    });
  }

  async deleteForUser(id_user: string, id_address: string) {
    await this.ensureOwnedByUser(id_user, id_address);

    return this.prisma.address.delete({
      where: { id_address },
    });
  }

  private async ensureOwnedByUser(id_user: string, id_address: string) {
    const address = await this.prisma.address.findFirst({
      where: { id_address, id_user },
      select: { id_address: true },
    });

    if (!address) {
      throw new NotFoundException('Dirección no encontrada');
    }
  }
}
