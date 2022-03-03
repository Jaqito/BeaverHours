import { default as axios } from "axios";
import {
  CardFactory,
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
  ConversationParameters,
} from "botbuilder";
import * as querystring from "querystring";
import { Connection } from "typeorm";
import addQueueEntryToDb from "./api/addQueueEntryToDb";
import addQueueToDb from "./api/addQueueToDb";
import fetchQueuesByOwner from "./api/fetchQueuesByOwner";
import fetchQueueEntriesByQueueId from "./api/fetchQueueEntriesByQueueId";
import updateQueueStatusInDb from "./api/updateQueueStatusInDb";
import { QueueStatus } from "./utilities/Global";
import updateQueueEntryResolved from "./api/updateQueueEntryResolved";
import Queue from "./utilities/Queue";
import { getNamesOfTeamMembers } from "./api/getNamesOfTeamMembers";
import QueueEntry from "./utilities/QueueEntry";
import { StudentStatus } from "./utilities/Global";
import fetch from "node-fetch";
import { getAccessToken } from "./utilities/Auth";
import dotenv from "dotenv";
import path from "path";
if (process.env.NODE_ENV !== "production") {
  const ENV_FILE = path.join(__dirname, ".env.teamsfx.local");
  dotenv.config({ path: ENV_FILE });
}

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
      console.log("Running with Message Activity.");

      let txt = context.activity.text;
      const removedMentionText = TurnContext.removeRecipientMention(
        context.activity
      );
      if (removedMentionText) {
        // Remove the line break
        txt = removedMentionText.toLowerCase().replace(/\n|\r/g, "").trim();
      }

      // build a reusable mention to user that invoked bot
      const mention = {
        mentioned: context.activity.from,
        text: `<at>${new TextEncoder().encode(
          context.activity.from.name
        )}</at>`,
        type: "mention",
      };

      // Trigger command by IM text
      switch (txt) {
        case "start office hour": {
          if (this.activeQueue) {
            await context.sendActivity(
              'Office hour already in progress. End active office hour with the command "end office hour"'
            );
          } else {
            this.activeQueue = new Queue({
              ownerId: context.activity.from.id,
              channelId: context.activity.channelId,
            });
            const queue = await addQueueToDb(
              this.dbConnection,
              this.activeQueue
            );
            this.activeQueue.updateId(queue.id);
            await context.sendActivity(
              "Office hours have started! Use the bot command <b>join office hours</b> to get in line\n\n"
            );
          }
          break;
        }
        case "end office hour": {
          if (this.activeQueue) {
            this.activeQueue.updateStatus(QueueStatus.Closed);
            await updateQueueStatusInDb(this.dbConnection, this.activeQueue);
            this.activeQueue = null;
            await context.sendActivity("Office hour successfully ended.");
          } else {
            await context.sendActivity(
              'No office hour currently active. Start an office hour with the command "start office hour"'
            );
          }
          break;
        }
        case "leave office hours": {
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
        case "get queue position": {
          if (this.activeQueue) {
            if (!this.activeQueue.checkQueue(context.activity.from.id)) {
              await context.sendActivity(
                "You are currently not in line for office hours!"
              );
            } else {
              const mention = {
                mentioned: context.activity.from,
                text: `<at>${new TextEncoder().encode(
                  context.activity.from.name
                )}</at>`,
                type: "mention",
              };
              const replyActivity = MessageFactory.text(
                `Hello ${mention.text}! You are currently in position ${
                  this.activeQueue.getQueuePosition(context.activity.from.id) +
                  1
                }.`
              );
              replyActivity.entities = [mention];
              await context.sendActivity(replyActivity);
            }
          } else {
            await context.sendActivity(
              "Currently no office hours being held. Please check the schedule to confirm the next office hours session!"
            );
          }
          break;
        }
        case "my office hours": {
          const queues = await fetchQueuesByOwner(
            this.dbConnection,
            context.activity.from.id,
            context.activity.channelId
          );
          const queueObjects = queues.map((queueEntity) =>
            Queue.fromQueueEntity(queueEntity)
          );
          queueObjects.forEach(
            async (queue) =>
              await context.sendActivity(queue.propertiesToString())
          );
          break;
        }
        case "view active queue": {
          try {
            const teamMembers = await getNamesOfTeamMembers(context);
            if (this.activeQueue) {
              const queueMembers =
                this.activeQueue.getNamesInQueue(teamMembers);
              await context.sendActivity(queueMembers);
            } else {
              await context.sendActivity("No office hour currently active!");
            }
          } catch (e) {
            console.error('Error performing command "view queue"\n' + e);
            throw e;
          }
          break;
        }
        case "mark student complete": {
          // only one student at a time can be in a conversing state
          const studentToUpdate: QueueEntry =
            this.activeQueue.findFirstConversing();
          if (studentToUpdate != undefined && !this.activeQueue.isEmpty()) {
            studentToUpdate.setResolvedState(StudentStatus.Resolved);
            const updateResult = await updateQueueEntryResolved(
              this.dbConnection,
              studentToUpdate.id,
              studentToUpdate.resolved
            );
            console.log(`Updated: ${updateResult}`);
            await context.sendActivity(
              `Student conversation resolved:${studentToUpdate.toString()}`
            );
          } else {
            await context.sendActivity(
              "Unable to mark student as completed - there are either no students conversing with an instructor or no students are in line."
            );
          }
          break;
        }
        case "get next student": {
          const anyConversing: QueueEntry =
            this.activeQueue.findFirstConversing();
          if (anyConversing != undefined) {
            await context.sendActivity(
              `Have you finished helping the other student? Please resolve the conversation with the current student via 'mark student complete'. Currently needs resolving: ${anyConversing.toString()}`
            );
          } else if (this.activeQueue.isEmpty()) {
            await context.sendActivity(
              "There are currently no students in line!"
            );
          } else {
            const nextInLine = this.activeQueue.findFirstWaiting();
            if (nextInLine == undefined) {
              await context.sendActivity(
                "There are no students in queue looking for help right now."
              );
              break;
            }
            nextInLine.setResolvedState(StudentStatus.Conversing);
            const updateResult = await updateQueueEntryResolved(
              this.dbConnection,
              nextInLine.id,
              nextInLine.resolved
            );
            console.log(`Updated: ${updateResult}`);
            await context.sendActivity(
              `Next student to be helped:${nextInLine.toString()}`
            );
            // future functionality to automatically place new student into meeting/chat with instructor
            var req = {
              "bot": {
                "id": context.activity.channelData.tenant.id,
                "name": context.activity.recipient.name
              },
              "isGroup": true,
              "members": [
                {
                    "id": nextInLine.userId
                }
              ],
              "channelData": {
                "tenant": {
                    "id": context.activity.conversation.tenantId
                }
              }
            } as ConversationParameters;
            try {
                var access_token = await getAccessToken();
                console.log(`Context: ${JSON.stringify(context.activity)}`);
                // console.log(`adapter: ${JSON.stringify(context.adapter)}`);
                // console.log(`Access Token: ${access_token}`);
                console.log(`Requesting ${context.activity.serviceUrl + "v3/conversations"}`);
                var response = await fetch(`${context.activity.serviceUrl}v3/conversations`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${access_token}`
                        },
                        body: JSON.stringify(req)
                    }
                );
                if (!response.ok) {
                    console.log("Error when requesting new conversation");
                    console.log(await response.json());
                } else if (response.status >= 400) {
                    console.log(`HTTP Request Error ${response.status}: ${response.statusText}`);
                    console.log(await response.json());
                } else {
                    console.log(`HTTP Request Success ${response.status}: ${response.statusText}`);
                    console.log(await response.json());
                }
            } catch (error) {
                console.log(`Fetch error - ${error}`);
            }
          }
          break;
        }
      }
      if (txt.startsWith("private join office hours")) {
        try {
          const question: string = txt
            .replace("private join office hours", "")
            .trim();
          if (this.activeQueue) {
            if (this.activeQueue.checkQueue(context.activity.from.id)) {
              const replyActivity = MessageFactory.text(
                `Hello ${mention.text}! You are already in queue.`
              );
              replyActivity.entities = [mention];
              await context.sendActivity(replyActivity);
            } else {
              const queueEntryEntity = await addQueueEntryToDb(
                this.dbConnection,
                context.activity.from.id,
                this.activeQueue.properties.id,
                { question, privateEntry: true }
              );
              this.activeQueue.enqueueQueueEntryEntity(queueEntryEntity);
              const replyActivity = MessageFactory.text(
                `Hello ${
                  mention.text
                }! You have entered the office hours queue, the instructor will get to you! You are in position ${
                  this.activeQueue.getQueuePosition(context.activity.from.id) +
                  1
                }.`
              );
              replyActivity.entities = [mention];
              await context.sendActivity(replyActivity);
            }
          } else {
            const replyActivity = MessageFactory.text(
              `Hello ${mention.text}! Currently no office hours being held. Please check the schedule to confirm the next office hours session!`
            );
            replyActivity.entities = [mention];
            await context.sendActivity(replyActivity);
          }
        } catch (e) {
          console.error(
            'Error performing command "private join office hours"\n' + e
          );
          throw e;
        }
      }

      if (txt.startsWith("join office hours")) {
        try {
          const question: string = txt.replace("join office hours", "").trim();
          if (this.activeQueue) {
            if (this.activeQueue.checkQueue(context.activity.from.id)) {
              const replyActivity = MessageFactory.text(
                `Hello ${mention.text}! You are already in queue.`
              );
              replyActivity.entities = [mention];
              await context.sendActivity(replyActivity);
            } else {
              const queueEntryEntity = await addQueueEntryToDb(
                this.dbConnection,
                context.activity.from.id,
                this.activeQueue.properties.id,
                { question, privateEntry: false }
              );
              this.activeQueue.enqueueQueueEntryEntity(queueEntryEntity);
              const replyActivity = MessageFactory.text(
                `Hello ${
                  mention.text
                }! You have entered the office hours queue, the instructor will get to you! You are in position ${
                  this.activeQueue.getQueuePosition(context.activity.from.id) +
                  1
                }.`
              );
              replyActivity.entities = [mention];
              await context.sendActivity(replyActivity);
            }
          } else {
            const replyActivity = MessageFactory.text(
              `Hello ${mention.text}! Currently no office hours being held. Please check the schedule to confirm the next office hours session!`
            );
            replyActivity.entities = [mention];
            await context.sendActivity(replyActivity);
          }
        } catch (e) {
          console.error('Error performing command "join office hours"\n' + e);
          throw e;
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });
  }
}

export const sendNewMessage = async () => {

}