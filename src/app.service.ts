import { Injectable, Inject } from '@nestjs/common';
import { MSSQL_CONNECTION } from './constants';
import * as bcrypt from 'bcrypt';
import * as CryptoJS from 'crypto';

@Injectable()
export class AppService {
  constructor(@Inject(MSSQL_CONNECTION) private conn: any) {}

  // async mysqlCallStoredProcedure(msg: string) {
  //returns a promise that resolves to a result set on success
  //   const execSql = (statement) => {
  //     const p = new Promise((res, rej) => {
  //       this.conn.query(statement, function (err, result) {
  //         if (err) rej(err);
  //         else res(result);
  //       });
  //     });
  //     return p;
  //   };
  //   const res = await execSql('call getTest()');
  //   return res;
  // }

  async mssqlCallStoredProcedure(username: string) {
    //returns a promise that resolves to a result set on success
    const db = await this.conn.connect();
    const res = await db.query(`EXEC get_user  @Username = N'${username}'`);
    console.log(res);
    return { pass: res['recordset'][0]['Password'] };
  }

  parseQueryResponse(res) {
    const nres = [];
    res.recordset.forEach((element) => {
      delete element.Password;
      delete element.IsActive;
      delete element.CreatedBy;
      delete element.LastModifiedBy;
      delete element.LastModifiedOn;
      delete element.UserKey;
      delete element.Code;
      delete element.UserType;
      delete element.CreatedOn;
      delete element.PasswordIsModified;

      const [firstName, lastName] = element.Name.split(' ');
      element.FirstName = firstName;
      element.lastName = lastName;

      const lowerCase = (str) => str[0].toLowerCase() + str.slice(1);
      const nelement = Object.fromEntries(
        Object.entries(element).map(([k, v]) => [lowerCase(k), v]),
      );
      nelement.roles = ['USER'];
      nres.push(nelement);
    });
    return nres;
  }

  async getUsers(search: string, first: number, max: number) {
    const db = await this.conn.connect();
    const res = this.parseQueryResponse(
      await db.query(`SELECT * FROM Master_user`),
    );
    return res;
  }

  async getUsersCount() {
    const db = await this.conn.connect();
    const res = await db.query(
      `SELECT COUNT(UserKey) as count FROM Master_user`,
    );
    return res.recordset[0].count;
  }

  async getUserById(username: string) {
    const db = await this.conn.connect();
    const res = this.parseQueryResponse(
      await db.query(`EXEC get_user  @Username = N'${username}'`),
    );
    return res[0];
  }

  async getUserCredentials(username: string) {
    const db = await this.conn.connect();
    const res = await db.query(`EXEC get_user  @Username = N'${username}'`);
    const saltRounds = 1000;
    const cred_res = [];
    res.recordset.forEach((ele) => {
      // const salt = bcrypt.genSaltSync(saltRounds);
      const salt = CryptoJS.randomBytes(32);
      const hash = CryptoJS.pbkdf2Sync(
        ele.Password,
        salt,
        saltRounds,
        64,
        'sha256',
      );
      // const hash = bcrypt.hashSync(ele.Password, salt);
      cred_res.push({
        value: hash.toString('base64'),
        salt: salt.toString('base64'),
        algorithm: 'pbkdf2-sha256',
        iterations: saltRounds,
        type: 'password',
      });
    });
    return cred_res[0];
  }
}
