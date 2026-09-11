import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Movie } from './movie.entity';
import { BaseEntity } from '../../utils/base.entity';

export enum VideoQuality {
  P240 = '240p',
  P360 = '360p',
  P480 = '480p',
  P720 = '720p',
  P1080 = '1080p',
  P4K = '4K',
};
export enum SourceType {
  uploaded = 'UPLOADED',
  external = 'EXTERNAL'
};

@Entity('movie_files')
export class MovieFile extends BaseEntity {
  @ManyToOne(() => Movie, (movie) => movie.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie: Movie;

  @Column({ type: 'varchar', length: 255, nullable: true })
  file_url: string;

  @Column({ type: 'varchar', nullable: true })
  external_url: string;

  @Column({ type: 'enum', enum: SourceType, default: SourceType.uploaded })
  source_type: SourceType

  @Column({ type: 'enum', enum: VideoQuality, nullable: true })
  quality: VideoQuality;

  @Column({ type: 'varchar', length: 20, default: 'uz' })
  language: string;
}