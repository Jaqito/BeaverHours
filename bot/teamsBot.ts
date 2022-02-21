import { default as axios } from "axios";
import {
  CardFactory,
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
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
<<<<<<< HEAD
import { getNamesOfTeamMembers } from "./api/getNamesOfTeamMembers";
=======
import QueueEntry from "./utilities/QueueEntry";
import { StudentStatus } from "./utilities/Global";
>>>>>>> 124cd62 (mark student complete command started, untested, setResolvedState added to QueueEntry)

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
        }
        case "mark student complete": {
            // can only mark a student as complete if there is a student marked as conversing in the non-empty queue
            // only one student in a conversing state at a time
            // iterate over queue and pass the student that is currently conversing into queue
            const studentToUpdate: QueueEntry = this.activeQueue.findFirstConversing();
            if (studentToUpdate != undefined && this.activeQueue.length > 0) {
                studentToUpdate.setResolvedState(StudentStatus.Resolved);
                const updateResult = await updateQueueEntryResolved(this.dbConnection, studentToUpdate.id);
                await context.sendActivity(`Student conversation resolved:${studentToUpdate.toString()}`);
            } else {
                await context.sendActivity("There are either no students conversing with an instructor or no students are in line.");
            }
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
