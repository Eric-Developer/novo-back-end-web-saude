import cloudinary from '../config/cloudinaryConfig';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

class CloudinaryService {
  public async uploadImage(imagePath: string): Promise<string> {
    try {
      const result: UploadApiResponse = await cloudinary.uploader.upload(
        imagePath,
        {
          folder: 'health-unit',
        }
      );

      return result.secure_url;
    } catch (error) {
      throw new Error(
        `Erro ao fazer upload para o Cloudinary: ${(error as UploadApiErrorResponse).message}`
      );
    }
  }

  public async uploadImages(imagePaths: string[]): Promise<string[]> {
    try {
      const uploadPromises = imagePaths.map((imagePath) =>
        cloudinary.uploader.upload(imagePath, {
          folder: 'health-unit',
        })
      );

      // Espera todos os uploads terminarem
      const uploadResults = await Promise.all(uploadPromises);

      // Retorna as URLs das imagens carregadas
      return uploadResults.map(
        (result: UploadApiResponse) => result.secure_url
      );
    } catch (error) {
      throw new Error(
        `Erro ao fazer upload para o Cloudinary: ${(error as UploadApiErrorResponse).message}`
      );
    }
  }
}
export default new CloudinaryService();
