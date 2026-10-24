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
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_request, file, callback) => {
        if (file.mimetype !== 'image/jpeg') {
          callback(
            new BadRequestException('La foto debe estar convertida a JPEG.'),
            false,
          );
          return;
        }
        callback(null, true);
      },
    }),
  )
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
  async updateProduct(
    @Param('id') id: string,
    @Body() data: Prisma.ProductUpdateInput,
  ) {
    const product = await this.productsService.updateProduct(id, data);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  @Delete('/:id')
  async deleteProduct(@Param('id') id: string) {
    const product = await this.productsService.deleteProduct(id);
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }
}
