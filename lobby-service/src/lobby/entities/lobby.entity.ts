import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  game_id!: string;

  @Column({ default: 0 })
  rounds!: number;

  @Column({ default: 'PENDING' })
  status!: string; // PENDING | STARTED | FINISHED

  @CreateDateColumn()
  created_at!: Date;
}
