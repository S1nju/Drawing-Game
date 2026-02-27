import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Lobby {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  game_id!: string;

  @Column()
  rounds!: number;

  @Column({ default: 'PENDING' })
  status!: string; // PENDING | STARTED | FINISHED

  @Column({ default: 0 })
  current_round!: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}

