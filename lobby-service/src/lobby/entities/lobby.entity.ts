import {
  Entity,
  Column,
  PrimaryColumn,
  BeforeInsert,
  CreateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class Lobby {
  @PrimaryColumn('uuid')
  id: string;

  @BeforeInsert()
  generateId() {
    // This ensures NestJS generates the ID instead of Postgres
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @Column({ type: 'uuid' })
  game_id!: string;

  @Column({ default: 0 })
  rounds!: number;

  @Column({ default: 'PENDING' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;
}
