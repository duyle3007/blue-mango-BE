import { Controller, Get, NotFoundException, Param, Res } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { FileService } from 'src/modules/file/file.service';
import type { Response } from 'express';

@Controller('audio')
export class AudioController {
  constructor(private fileService: FileService) {}

  @Get('/:trackId')
  @ApiOperation({
    summary: 'Get audio',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Return audio file',
  })
  async getAudio(@Param('trackId') trackId: string, @Res() res: Response) {
    const downloadStream = this.fileService.getDownloadStreamFile(trackId);

    res.set({
      'content-type': 'audio/mp4',
      'accept-ranges': 'bytes',
    });

    downloadStream.on('data', (chunk) => {
      res.write(chunk);
    });

    downloadStream.on('error', () => {
      throw new NotFoundException('Audio is not found');
    });

    downloadStream.on('end', () => {
      res.end();
    });
  }
}
