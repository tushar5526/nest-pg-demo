import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async callStoredProcedure(msg: string) {
    const res = await this.conn.query(`call display_message('${msg}')`);
    return res.rows;
  }
}
