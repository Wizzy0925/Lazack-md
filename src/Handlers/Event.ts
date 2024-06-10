import chalk from 'chalk';
import { delay } from '@whiskeysockets/baileys';
import { Client } from '../Structures';
import { IEvent } from '../Types';

export class EventHandler {
    constructor(private client: Client) {}

    public handleEvents = async (event: IEvent): Promise<void> => {
        let group: { subject: string; description: string } = {
            subject: '',
            description: ''
        };
        await delay(1500);
        await this.client
            .groupMetadata(event.jid)
            .then((res) => {
                group.subject = res.subject;
                group.description = res.desc || 'No Description';
            })
            .catch(() => {
                group.subject = '__';
                group.description = '';
            });
        this.client.log(
            `${chalk.blueBright('EVENT')} ${chalk.green(
                `${this.client.utils.capitalize(event.action)}[${event.participants.length}]`
            )} in ${chalk.cyanBright(`$`)}`
        );
        const { events } = await this.client.DB.getGroup(event.jid);
        if (
            !events ||
            (event.action === 'remove' &&
                event.participants.includes(
                    `${(this.client.user?.id || '').split('@')[0].split(':')[0]}@s.whatsapp.net`
                ))
        )
            return void null;
        const text =
            event.action === 'add'
                ? `Hope you follow the rules♥️ and has arrived🌹. I wonder if they brought their own cup of tea🍵,type *${this.client.config.prefix}rules* to see those RULES\n\n*‣ ${event.participants
                      .map((jid) => `@${jid.split('@')[0]}`)
                      .join(' ')}*`
                : event.action === 'remove'
                ? `Goodbye *${event.participants
                      .map((jid) => `@${jid.split('@')[0]}`)
                      .join(', ')}* 👋🏻, It's been nice meeting you but we're probably not gonna miss you. *BITCH😂*`
                : event.action === 'demote'
                ? `Ara Ara, looks like *@${
                      event.participants[0].split('@')[0]
                  }* 📚you're fired and Adminship isn't for you😂`
                : `Congratulations *@${
                      event.participants[0].split('@')[0]
                  }*, ❤️you're an admin! 👌I hope you take care of us🌹*`;
        if (event.action === 'add') {
            let imageUrl: string | undefined;
            try {
                imageUrl = await this.client.profilePictureUrl(event.jid);
            } catch (error) {
                imageUrl = undefined;
            }
            const image = imageUrl
                ? await this.client.utils.getBuffer(imageUrl)
                : (this.client.assets.get('404') as Buffer);
            return void (await this.client.sendMessage(event.jid, {
                image: image,
                mentions: event.participants,
                caption: text
            }));
        }
        return void (await this.client.sendMessage(event.jid, {
            text,
            mentions: event.participants
        }));
    };

    public sendMessageOnJoiningGroup = async (group: { subject: string; jid: string }): Promise<void> => {
        this.client.log(`${chalk.blueBright('JOINED')} ${chalk.cyanBright(group.subject)}`);
        const videoUrl = 'https://telegra.ph/file/f9c7de087e840816e24b9.jpg'; // Replace 'URL_TO_YOUR_VIDEO' with the actual URL of your video
        const video = await this.client.utils.getBuffer(videoUrl);
        return void (await this.client.sendMessage(group.jid, {
            video: video,
            text: `Thanks for adding me in this group. Please use *${this.client.config.prefix}help* to get started.`
        }));
    };
    }
