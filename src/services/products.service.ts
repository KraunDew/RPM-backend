import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { IAService } from './ia.service';

@Injectable()
export class ProductsService {
  private s3Client?: S3Client;

  private readonly productRelations = {
    category: true,
    brand: true,
    supplier: true,
  } satisfies Prisma.ProductInclude;

  private readonly photoPrefix = 'products/';

  constructor(
    private readonly prisma: PrismaService,
    private readonly iaService: IAService,
  ) {}

  /**
   * Inicializa el cliente S3 solo cuando se necesita.
   * Utiliza las credenciales del bucket de Prisma Object Storage.
   */
  private getS3Client(): S3Client {
    if (this.s3Client) {
      return this.s3Client;
    }

    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new InternalServerErrorException(
        'Falta configurar el almacenamiento de imágenes en el servidor.',
      );
    }

    this.s3Client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    return this.s3Client;
  }

  private getBucketName(): string {
    const bucket = process.env.S3_BUCKET;

    if (!bucket) {
      throw new InternalServerErrorException(
        'No está configurado el bucket de imágenes.',
      );
    }

    return bucket;
  }

  /**
   * Sube una imagen JPEG a Prisma Object Storage.
   * Retorna la clave del objeto, no una URL temporal.
   */
  private async uploadPhoto(photo: Express.Multer.File): Promise<string> {
    if (!photo.buffer || photo.buffer.length === 0) {
      throw new InternalServerErrorException(
        'No se recibió el contenido de la imagen.',
      );
    }

    const key = `${this.photoPrefix}${randomUUID()}.jpg`;

    await this.getS3Client().send(
      new PutObjectCommand({
        Bucket: this.getBucketName(),
        Key: key,
        Body: photo.buffer,
        ContentType: 'image/jpeg',
        CacheControl: 'public, max-age=3600',
      }),
    );

    return key;
  }

  /**
   * Solo considera propias las claves creadas por este servicio.
   * Así no intenta borrar rutas locales antiguas del bucket.
   */
  private isManagedObjectKey(
    photoPath: string | null | undefined,
  ): photoPath is string {
    return Boolean(
      photoPath &&
      photoPath.startsWith(this.photoPrefix) &&
      !photoPath.includes('..'),
    );
  }

  private async removePhoto(
    photoPath: string | null | undefined,
  ): Promise<void> {
    if (!this.isManagedObjectKey(photoPath)) {
      return;
    }

    try {
      await this.getS3Client().send(
        new DeleteObjectCommand({
          Bucket: this.getBucketName(),
          Key: photoPath,
        }),
      );
    } catch (error) {
      // No ocultamos el error: el producto puede haberse actualizado
      // aunque la eliminación del objeto haya fallado.
      console.error(
        `No se pudo eliminar la imagen ${photoPath} del bucket:`,
        error,
      );
    }
  }

  /**
   * Genera una URL temporal para mostrar una imagen privada.
   * Las rutas locales antiguas no se convierten en URLs del bucket.
   */
  private async getPhotoUrl(
    photoPath: string | null | undefined,
  ): Promise<string | null> {
    if (!this.isManagedObjectKey(photoPath)) {
      return null;
    }

    return getSignedUrl(
      this.getS3Client(),
      new (await import('@aws-sdk/client-s3')).GetObjectCommand({
        Bucket: this.getBucketName(),
        Key: photoPath,
      }),
      { expiresIn: 3600 },
    );
  }

  private async addPhotoUrl<T extends { photo_path: string | null }>(
    product: T,
  ): Promise<T & { photo_url: string | null }> {
    return {
      ...product,
      photo_url: await this.getPhotoUrl(product.photo_path),
    };
  }

  getAllProducts() {
    return this.prisma.product
      .findMany({
        include: this.productRelations,
        orderBy: { name: 'asc' },
      })
      .then((products) =>
        Promise.all(products.map((product) => this.addPhotoUrl(product))),
      );
  }

  async getProductById(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id_product: id },
      include: this.productRelations,
    });

    if (!product) {
      return null;
    }

    return this.addPhotoUrl(product);
  }

  async createProduct(
    info: Prisma.ProductCreateInput,
    photo: Express.Multer.File,
  ) {
    const photoKey = await this.uploadPhoto(photo);

    try {
      // La clave del bucket queda almacenada en PostgreSQL.
      const data: Prisma.ProductCreateInput = {
        ...info,
        photo_path: photoKey,
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

      return this.addPhotoUrl(product);
    } catch (error) {
      // Si falla PostgreSQL, evitar dejar la imagen huérfana.
      await this.removePhoto(photoKey);
      throw error;
    }
  }

  async updateProduct(
    id: string,
    data: Prisma.ProductUpdateInput,
    newPhoto?: Express.Multer.File,
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
      return null;
    }

    if (newPhoto && removePhoto) {
      throw new Error(
        'No puedes reemplazar y eliminar la foto en la misma solicitud.',
      );
    }

    const updateData: Prisma.ProductUpdateInput = { ...data };

    // Nunca permitir que el JSON del cliente cambie directamente la clave.
    delete updateData.photo_path;

    let newPhotoKey: string | undefined;

    if (newPhoto) {
      newPhotoKey = await this.uploadPhoto(newPhoto);
      updateData.photo_path = newPhotoKey;
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
      if (newPhotoKey) {
        await this.removePhoto(newPhotoKey);
      }

      throw error;
    }

    const photoChanged = Boolean(newPhotoKey) || removePhoto;

    if (
      photoChanged &&
      existingProduct.photo_path &&
      existingProduct.photo_path !== newPhotoKey
    ) {
      await this.removePhoto(existingProduct.photo_path);
    }

    void this.iaService.generateProductEmbedding(id).catch((error: unknown) => {
      console.error('Error generating product embedding:', error);
    });

    return this.addPhotoUrl(product);
  }

  async deleteProduct(id: string) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id_product: id },
    });

    if (!existingProduct) {
      return null;
    }

    const product = await this.prisma.product.delete({
      where: { id_product: id },
    });

    await this.removePhoto(existingProduct.photo_path);

    return product;
  }
}
