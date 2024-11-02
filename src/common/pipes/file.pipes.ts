import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class ImageValidationPipe implements PipeTransform {
    transform(file: Express.Multer.File, metadata: ArgumentMetadata) {
        if (metadata.type === "custom") {
            if (!file) throw new BadRequestException('file does not');
            const validTypes = ['image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file[0].mimetype)) {
                throw new BadRequestException('Upload Just File  With This Format [JPEG , JPG] ');
            }
            return file
        }
        return file;
    }
}
