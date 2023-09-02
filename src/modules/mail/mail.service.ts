import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { IMailgunClient } from 'mailgun.js/interfaces/IMailgunClient';
import { ErrorType } from './types/error.type';

@Injectable()
export class MailService {
  private mailGun: IMailgunClient;
  constructor() {
    const mailgun = new Mailgun(FormData);
    this.mailGun = mailgun.client({
      key: '7ebb5fa74b06885a2f7102a62d4e3fb5-18e06deb-3151ce6e',
      username: 'api',
    });
  }

  async sendExitedClientInvitation(clientInviationInfo: {
    email: string;
    therapistName: string;
    therapistEmail: string;
  }) {
    const { email, therapistEmail, therapistName } = clientInviationInfo;

    const data = {
      from: 'Mailgun Sandbox <postmaster@nqdai.me>',
      to: email,
      subject: 'An invitation from Bluemango',
      template: 'paitient_invitation',
      'h:X-Mailgun-Variables': JSON.stringify({
        therapist_name: therapistName,
        therapist_email: therapistEmail,
      }),
    };
    try {
      const body = await this.mailGun.messages.create('nqdai.me', data);
      console.log(body);
    } catch (err) {
      console.log(err);
      throw new ServiceUnavailableException(ErrorType.SEND_EMAIL_ERROR);
    }
  }

  async sendNewClientInvitation(clientInviationInfo: {
    email: string;
    therapistName: string;
    therapistEmail: string;
    changePasswordLink: string;
  }) {
    const { email, therapistEmail, therapistName, changePasswordLink } =
      clientInviationInfo;

    const data = {
      from: 'Mailgun Sandbox <postmaster@nqdai.me>',
      to: email,
      subject: 'An invitation from Bluemango',
      template: 'new_patient_invitation',
      'h:X-Mailgun-Variables': JSON.stringify({
        therapist_name: therapistName,
        therapist_email: therapistEmail,
        change_pass_link: changePasswordLink,
      }),
    };
    try {
      const body = await this.mailGun.messages.create('nqdai.me', data);
      console.log(body);
    } catch (err) {
      console.log(err);
      throw new ServiceUnavailableException(ErrorType.SEND_EMAIL_ERROR);
    }
  }

  async sendAudioAcceptance(clientInviationInfo: {
    email: string;
    therapistName: string;
    therapistEmail: string;
    fileName: string;
  }) {
    const { email, therapistEmail, therapistName, fileName } =
      clientInviationInfo;

    const data = {
      from: 'Mailgun Sandbox <postmaster@nqdai.me>',
      to: email,
      subject: 'An acception from Bluemango',
      template: 'audio_acceptance',
      'h:X-Mailgun-Variables': JSON.stringify({
        therapist_name: therapistName,
        therapist_email: therapistEmail,
        filename: fileName,
      }),
    };
    try {
      const body = await this.mailGun.messages.create('nqdai.me', data);
      console.log(body);
    } catch (err) {
      console.log(err);
      throw new ServiceUnavailableException(ErrorType.SEND_EMAIL_ERROR);
    }
  }
}
