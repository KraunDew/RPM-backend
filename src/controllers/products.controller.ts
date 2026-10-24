import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Prisma } from 'generated/prisma/client';
import { ProductsService } from 'src/services/products.service';

const photoUploadOptions = {
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype !== 'image/jpeg') {
      callback(
        new BadRequestException('La foto debe estar convertida a JPEG.'),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

@Controller('/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get('/:id')
  async getProduct(@Param('id') id: string) {
    const product = await this.productsService.getProductById(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo', photoUploadOptions))
  async createProduct(
    @Body('data') rawData: string,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    if (!photo) {
      throw new BadRequestException(
        'Debes adjuntar una foto JPEG en el campo "photo".',
      );
    }

    if (!rawData) {
      throw new BadRequestException('Faltan los datos del producto.');
    }

    let data: Prisma.ProductCreateInput;

    try {
      data = JSON.parse(rawData) as Prisma.ProductCreateInput;
    } catch {
      throw new BadRequestException(
        'Los datos del producto no tienen un formato JSON válido.',
      );
    }

    return this.productsService.createProduct(data, photo.path);
  }

  @Patch('/:id')
  @UseInterceptors(FileInterceptor('photo', photoUploadOptions))
  async updateProduct(
    @Param('id') id: string,
    @Body('data') rawData: string | undefined,
    @Body('removePhoto') rawRemovePhoto: string | undefined,
    @UploadedFile() photo?: Express.Multer.File,
  ) {
    let data: Prisma.ProductUpdateInput = {};

    // Acepta tanto JSON normal como multipart/form-data.
    if (rawData) {
      try {
        data = JSON.parse(rawData) as Prisma.ProductUpdateInput;
      } catch {
        throw new BadRequestException(
          'Los datos del producto no tienen un formato JSON válido.',
        );
      }
    } else if (!photo && rawRemovePhoto !== 'true') {
      throw new BadRequestException(
        'Debes enviar los datos que deseas actualizar.',
      );
    }

    const removePhoto = rawRemovePhoto === 'true';

    if (photo && removePhoto) {
      throw new BadRequestException(
        'No puedes reemplazar y eliminar la foto en la misma solicitud.',
      );
    }

    // La gestión del archivo y su campo de base de datos
    // se delega al servicio.
    const product = await this.productsService.updateProduct(
      id,
      data,
      photo?.path,
      removePhoto,
    );

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productsService.deleteProduct(id);

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }
}
