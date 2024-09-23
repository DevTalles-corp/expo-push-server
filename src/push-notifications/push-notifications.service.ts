import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { Expo, ExpoPushMessage } from 'expo-server-sdk';

@Injectable()
export class PushNotificationsService {
  private expo = new Expo({
    // accessToken: process.env.EXPO_ACCESS_TOKEN,
    useFcmV1: true,
  });

  sendNotification(toTokens: string[]) {
    const areExpoTokens = toTokens.every(Expo.isExpoPushToken);

    if (!areExpoTokens) {
      throw new BadRequestException('Invalid expo push tokens');
    }

    const messages: ExpoPushMessage[] = toTokens.map((token) => ({
      to: token,
      sound: 'default',
      body: 'This is a test notification form my backend',
      title: 'Hola título',
      data: { chatId: 'XYZ-456' },
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = this.expo.sendPushNotificationsAsync(chunk);
        tickets.push(ticketChunk);
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException(
          'Error sending push notification chunks',
        );
      }
    }

    return {
      done: true,
    };
  }
}
