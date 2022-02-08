import { default as axios } from 'axios';
import { CardFactory, TeamsActivityHandler, TurnContext, MessageFactory } from 'botbuilder';
import * as querystring from 'querystring';
import { Connection } from 'typeorm';
import addQueueEntryToDb from './api/addQueueEntryToDb';
import addQueueToDb from './api/addQueueToDb';
import Queue from './utilities/Queue';

export interface DataInterface {
    likeCount: number;
}

export class TeamsBot extends TeamsActivityHandler {
    // record the likeCount
    likeCountObj: { likeCount: number };
    activeQueue: Queue;
    dbConnection: Connection;

    constructor(dbConnection: Connection) {
        super();
        this.dbConnection = dbConnection;
        this.likeCountObj = { likeCount: 0 };
        this.activeQueue = null;

        this.onMessage(async (context, next) => {
            console.log('Running with Message Activity.');

            let txt = context.activity.text;
            const removedMentionText = TurnContext.removeRecipientMention(context.activity);
            if (removedMentionText) {
                // Remove the line break
                txt = removedMentionText.toLowerCase().replace(/\n|\r/g, '').trim();
            }

            // build a reusable mention to user that invoked bot
            const mention = {
                mentioned: context.activity.from,
                text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
                type: 'mention',
            };

            // Trigger command by IM text
            switch (txt) {
                case 'start office hour': {
                    if (this.activeQueue) {
                        await context.sendActivity(
                            'Office hour already in progress. End active office hour with the command "end office hour"'
                        );
                    } else {
                        this.activeQueue = new Queue({
                            ownerId: context.activity.from.id,
                            channelId: context.activity.channelId,
                        });
                        const queue = await addQueueToDb(this.dbConnection, this.activeQueue);
                        this.activeQueue.updateId(queue.id);
                        await context.sendActivity(
                            '<b>Started new Queue<b>\n\n' +
                                `<b>id</b>        ${this.activeQueue.properties.id}\n\n` +
                                `<b>ownerId</b>   ${this.activeQueue.properties.ownerId}\n\n` +
                                `<b>channelId</b> ${this.activeQueue.properties.channelId}\n\n` +
                                `<b>status</b>    ${this.activeQueue.properties.status}\n\n` +
                                `<b>at</b>        ${this.activeQueue.properties.startTime}`
                        );
                    }
                    break;
                }
                case 'end office hour': {
                    if (this.activeQueue) {
                        this.activeQueue = null;
                        await context.sendActivity('Office hour successfully ended.');
                    } else {
                        await context.sendActivity(
                            'No office hour currently active. Start an office hour with the command "start office hour"'
                        );
                    }
                    break;
                }
                case 'join office hours': {
                    if (this.activeQueue) {
                        if (this.activeQueue.checkQueue(context.activity.from.id)) {
                            const replyActivity = MessageFactory.text(
                                `Hello ${mention.text}! You are already in queue.`
                            );
                            replyActivity.entities = [mention];
                            await context.sendActivity(replyActivity);
                        } else {
                            this.activeQueue.enqueueStudent(context.activity.from.id);
                            await addQueueEntryToDb(
                                this.dbConnection,
                                context.activity.from.id,
                                this.activeQueue.properties.id
                            );
                            const replyActivity = MessageFactory.text(
                                `Hello ${
                                    mention.text
                                }! You have entered the office hours queue, the instructor will get to you! You are in position ${
                                    this.activeQueue.getQueuePosition(context.activity.from.id) + 1
                                }.`
                            );
                            replyActivity.entities = [mention];
                            await context.sendActivity(replyActivity);
                            await context.sendActivity(`Current queue: ${this.activeQueue.queueToString()}`);
                        }
                    } else {
                        const replyActivity = MessageFactory.text(
                            `Hello ${mention.text}! Currently no office hours being held. Please check the schedule to confirm the next office hours session!`
                        );
                        replyActivity.entities = [mention];
                        await context.sendActivity(replyActivity);
                    }
                    break;
                }
                case 'leave office hours': {
                    if (this.activeQueue) {
                        if (!this.activeQueue.checkQueue(context.activity.from.id)) {
                            const replyActivity = MessageFactory.text(
                                `Hello ${mention.text}! Unable to remove, you are currently not in a queue.`
                            );
                            replyActivity.entities = [mention];
                            await context.sendActivity(replyActivity);
                        } else {
                            this.activeQueue.dequeueStudent(context.activity.from.id);
                            const replyActivity = MessageFactory.text(
                                `Hello ${mention.text}! You have successfully been removed from the queue.`
                            );
                            replyActivity.entities = [mention];
                            await context.sendActivity(replyActivity);
                            await context.sendActivity(`Current queue: ${this.activeQueue.queueToString()}`);
                        }
                    } else {
                        const replyActivity = MessageFactory.text(
                            `Hello ${mention.text}! Currently no office hours being held. Please check the schedule to confirm the next office hours session!`
                        );
                        replyActivity.entities = [mention];
                        await context.sendActivity(replyActivity);
                    }
                    break;
                }
                case 'get queue position': {
                    if (this.activeQueue) {
                        if (!this.activeQueue.checkQueue(context.activity.from.id)) {
                            await context.sendActivity('You are currently not in a queue.');
                        } else {
                            const mention = {
                                mentioned: context.activity.from,
                                text: `<at>${new TextEncoder().encode(context.activity.from.name)}</at>`,
                                type: 'mention',
                            };
                            const replyActivity = MessageFactory.text(
                                `Hello ${mention.text}! You are currently in position ${
                                    this.activeQueue.getQueuePosition(context.activity.from.id) + 1
                                }.`
                            );
                            replyActivity.entities = [mention];
                            await context.sendActivity(replyActivity);
                        }
                    } else {
                        await context.sendActivity(
                            'Currently no office hours being held. Please check the schedule to confirm the next office hours session!'
                        );
                    }
                    break;
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
  }