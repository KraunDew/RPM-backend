import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { unlink } from 'node:fs/promises';
import { isAbsolute, relative, resolve, sep } from 'node:path';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAService } from './ia.service';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IAService,
  ) {}

  private readonly productRelations = {
    category: true,
    brand: true,
    supplier: true,
  } satisfies Prisma.ProductInclude;

  private readonly photosDirectory = resolve(process.cwd(), 'public', 'photos');

  /**
   * Elimina únicamente archivos que se encuentren dentro
   * de public/photos. Evita borrar rutas arbitrarias.
   */
  private async removePhotoFile(
    photoPath: string | null | undefined,
  ): Promise<void> {
    if (!photoPath) return;

    const absolutePath = isAbsolute(photoPath)
      ? resolve(photoPath)
      : resolve(process.cwd(), photoPath);

    const relativePath = relative(this.photosDirectory, absolutePath);

    if (
      !relativePath ||
      relativePath === '..' ||
      relativePath.startsWith(`..${sep}`) ||
      isAbsolute(relativePath)
    ) {
      console.warn(
        'No se eliminó un archivo fuera de public/photos:',
        photoPath,
      );
      return;
    }

    try {
      await unlink(absolutePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== 'ENOENT') {
        console.error('No se pudo eliminar el archivo de imagen:', error);
      }
    }
  }

  getAllProducts() {
    return this.prisma.product.findMany({
      include: this.productRelations,
      orderBy: { name: 'asc' },
    });
  }

  getProductById(id: string) {
    return this.prisma.product.findUnique({
      where: { id_product: id },
      include: this.productRelations,
    });
  }

  async createProduct(info: Prisma.ProductCreateInput, photo_path: string) {
    const data: Prisma.ProductCreateInput = {
      ...info,
      photo_path,
    };

    const product = await this.prisma.product.create({
      data,
      include: this.productRelations,
    });

    void this.iaService
      .generateProductEmbedding(product.id_product)
      .catch((error: unknown) => {
        console.error('Error generating product embedding:', error);
      });

    return product;
  }

  async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput,
    newPhotoPath?: string,
    removePhoto = false,
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id_product: id },
      select: {
        id_product: true,
        photo_path: true,
      },
    });

    if (!existingProduct) {
      // No dejar archivos huérfanos si Multer ya guardó la foto.
      if (newPhotoPath) {
        await this.removePhotoFile(newPhotoPath);
      }

      return null;
    }

    if (newPhotoPath && removePhoto) {
      await this.removePhotoFile(newPhotoPath);

      throw new Error(
        'No puedes reemplazar y eliminar la foto en la misma solicitud.',
      );
    }

    const updateData: Prisma.ProductUpdateInput = {
      ...data,
    };

    if (newPhotoPath) {
      updateData.photo_path = newPhotoPath;
    } else if (removePhoto) {
      updateData.photo_path = null;
    }

    let product;

    try {
      product = await this.prisma.product.update({
        where: { id_product: id },
        data: updateData,
        include: this.productRelations,
      });
    } catch (error) {
      // Si falla Prisma, intentar limpiar la nueva imagen subida.
      if (newPhotoPath) {
        await this.removePhotoFile(newPhotoPath);
      }

      throw error;
    }

    // Borrar la imagen anterior solo después de guardar los cambios.
    const photoChanged = Boolean(newPhotoPath) || removePhoto;

    if (
      photoChanged &&
      existingProduct.photo_path &&
      existingProduct.photo_path !== newPhotoPath
    ) {
      await this.removePhotoFile(existingProduct.photo_path);
    }

    void this.iaService.generateProductEmbedding(id).catch((error: unknown) => {
      console.error('Error generating product embedding:', error);
    });

    return product;
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id_product: id },
    });

    if (!existingProduct) return null;

    const product = await this.prisma.product.delete({
      where: { id_product: id },
    });

    // Eliminar la foto asociada después de borrar el producto.
    await this.removePhotoFile(existingProduct.photo_path);

    return product;
  }
}
