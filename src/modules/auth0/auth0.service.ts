import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as auth0 from 'auth0';
import omgopass from 'omgopass';
import { ErrorType } from './types/error.type';

@Injectable()
export class Auth0Service {
  private management: auth0.ManagementClient;
  private authClient: auth0.AuthenticationClient;

  constructor(private configService: ConfigService) {
    this.management = new auth0.ManagementClient({
      domain: this.configService.get<string>('AUTH0_CONFIG_DOMAIN'),
      clientId: this.configService.get<string>('AUTH0_CONFIG_CLIENT_ID'),
      clientSecret: this.configService.get<string>('AUTH0_CONFIG_SECRETE_ID'),
    });
  }

  /**
   * @async
   * @param email Email or user
   * @return {Object} User Info
   */
  async createUser(email: string) {
    try {
      return this.management.createUser({
        email,
        password: omgopass(),
        connection: this.configService.get<string>('AUTH0_CONFIG_CONNECTION'),
      });
    } catch (err) {
      console.log(err);
      throw new ServiceUnavailableException(ErrorType.AUTH0_CREATE_USER_ERROR);
    }
  }

  /**
   * @param email Email of account that existed in system
   * @async
   * @return {String} Link to change the password
   */

  async changePassword(email: string): Promise<string> {
    try {
      const { ticket } = await this.management.createPasswordChangeTicket({
        email,
        connection_id: this.configService.get<string>(
          'AUTH0_CONFIG_CONNECTION_ID',
        ),
      });

      return ticket;
    } catch (err) {
      throw new ServiceUnavailableException(
        ErrorType.AUTH0_CREATE_CHANGE_PASSWORD_TICKET_ERROR,
      );
    }
  }
}
