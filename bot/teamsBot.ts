import { AdaptiveCards } from "@microsoft/adaptivecards-tools";
import { default as axios } from "axios";
import {
  AdaptiveCardInvokeResponse,
  AdaptiveCardInvokeValue,
  CardFactory,
  TeamsActivityHandler,
  TurnContext,
  MessageFactory,
} from "botbuilder";
import * as querystring from "querystring";
import { Connection } from "typeorm";
import rawLearnCard from "./adaptiveCards/learn.json";
import rawWelcomeCard from "./adaptiveCards/welcome.json";
import addQueueEntryToDb from "./api/addQueueEntryToDb";
import addQueueToDb from "./api/addQueueToDb";
import fetchQueuesByOwner from "./api/fetchQueuesByOwner";
import fetchQueueEntriesByQueueId from "./api/fetchQueueEntriesByQueueId";
import Queue from "./utilities/Queue";

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
              "<b>Started new Queue<b>\n\n" +
                this.activeQueue.propertiesToString()
            );
          }
          break;
        }
        case "end office hour": {
          if (this.activeQueue) {
            this.activeQueue = null;
            await context.sendActivity("Office hour successfully ended.");
          } else {
            await context.sendActivity(
              'No office hour currently active. Start an office hour with the command "start office hour"'
            );
          }
          break;
        }
        case "join office hours": {
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
                this.activeQueue.properties.id
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
              await context.sendActivity(
                `Current queue: ${this.activeQueue.entriesToString()}`
              );
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
              await context.sendActivity(
                `Current queue: ${this.activeQueue.entriesToString()}`
              );
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
              await context.sendActivity("You are currently not in a queue.");
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
      }

      if (txt.startsWith("view queue")) {
        try {
          const queueIdString: string = txt.replace("view queue", "").trim();
          if (queueIdString === "") {
            if (this.activeQueue) {
              await context.sendActivity(this.activeQueue.entriesToString());
            } else {
              await context.sendActivity(
                'No office hour currently active. Did you mean "view queue (queueId)"?'
              );
            }
          } else {
            const queueId = Number(queueIdString);
            if (isNaN(queueId)) {
              await context.sendActivity(
                'Provided queue ID is not a valid integer. Please provide a valid integer for the command "view queue (queueId)".'
              );
            } else {
              const queueEntryEntities = await fetchQueueEntriesByQueueId(
                this.dbConnection,
                queueId
              );
              const tempQueue = new Queue({ id: queueId });
              queueEntryEntities.forEach((queueEntryEntity) => {
                tempQueue.enqueueQueueEntryEntity(queueEntryEntity);
              });
              await context.sendActivity(tempQueue.entriesToString());
            }
          }
        } catch (e) {
          console.error('Error performing command "view queue"\n' + e);
          throw e;
        }
      }

      // By calling next() you ensure that the next BotHandler is run.
      await next();
    });

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (let cnt = 0; cnt < membersAdded.length; cnt++) {
        if (membersAdded[cnt].id) {
          const card =
            AdaptiveCards.declareWithoutData(rawWelcomeCard).render();
          await context.sendActivity({
            attachments: [CardFactory.adaptiveCard(card)],
          });
          break;
        }
      }
      await next();
    });
  }

  // Invoked when an action is taken on an Adaptive Card. The Adaptive Card sends an event to the Bot and this
  // method handles that event.
  async onAdaptiveCardInvoke(
    context: TurnContext,
    invokeValue: AdaptiveCardInvokeValue
  ): Promise<AdaptiveCardInvokeResponse> {
    // The verb "userlike" is sent from the Adaptive Card defined in adaptiveCards/learn.json
    if (invokeValue.action.verb === "userlike") {
      this.likeCountObj.likeCount++;
      const card = AdaptiveCards.declare<DataInterface>(rawLearnCard).render(
        this.likeCountObj
      );
      await context.updateActivity({
        type: "message",
        id: context.activity.replyToId,
        attachments: [CardFactory.adaptiveCard(card)],
      });
      return { statusCode: 200, type: undefined, value: undefined };
    }
  }

  // Messaging extension Code
  // Action.
  public async handleTeamsMessagingExtensionSubmitAction(
    context: TurnContext,
    action: any
  ): Promise<any> {
    switch (action.commandId) {
      case "createCard":
        return createCardCommand(context, action);
      case "shareMessage":
        return shareMessageCommand(context, action);
      default:
        throw new Error("NotImplemented");
    }
  }

  // Search.
  public async handleTeamsMessagingExtensionQuery(
    context: TurnContext,
    query: any
  ): Promise<any> {
    const searchQuery = query.parameters[0].value;
    const response = await axios.get(
      `http://registry.npmjs.com/-/v1/search?${querystring.stringify({
        text: searchQuery,
        size: 8,
      })}`
    );

    const attachments = [];
    response.data.objects.forEach((obj) => {
      const heroCard = CardFactory.heroCard(obj.package.name);
      const preview = CardFactory.heroCard(obj.package.name);
      preview.content.tap = {
        type: "invoke",
        value: { name: obj.package.name, description: obj.package.description },
      };
      const attachment = { ...heroCard, preview };
      attachments.push(attachment);
    });

    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: attachments,
      },
    };
  }

  public async handleTeamsMessagingExtensionSelectItem(
    context: TurnContext,
    obj: any
  ): Promise<any> {
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [CardFactory.heroCard(obj.name, obj.description)],
      },
    };
  }

  // Link Unfurling.
  public async handleTeamsAppBasedLinkQuery(
    context: TurnContext,
    query: any
  ): Promise<any> {
    const attachment = CardFactory.thumbnailCard(
      "Image Preview Card",
      query.url,
      [query.url]
    );

    const result = {
      attachmentLayout: "list",
      type: "result",
      attachments: [attachment],
    };

    const response = {
      composeExtension: result,
    };
    return response;
  }
}

async function createCardCommand(
  context: TurnContext,
  action: any
): Promise<any> {
  // The user has chosen to create a card by choosing the 'Create Card' context menu command.
  const data = action.data;
  const heroCard = CardFactory.heroCard(data.title, data.text);
  heroCard.content.subtitle = data.subTitle;
  const attachment = {
    contentType: heroCard.contentType,
    content: heroCard.content,
    preview: heroCard,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}

async function shareMessageCommand(
  context: TurnContext,
  action: any
): Promise<any> {
  // The user has chosen to share a message by choosing the 'Share Message' context menu command.
  let userName = "unknown";
  if (
    action.messagePayload &&
    action.messagePayload.from &&
    action.messagePayload.from.user &&
    action.messagePayload.from.user.displayName
  ) {
    userName = action.messagePayload.from.user.displayName;
  }

  // This Messaging Extension example allows the user to check a box to include an image with the
  // shared message.  This demonstrates sending custom parameters along with the message payload.
  let images = [];
  const includeImage = action.data.includeImage;
  if (includeImage === "true") {
    images = [
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU",
    ];
  }
  const heroCard = CardFactory.heroCard(
    `${userName} originally sent this message:`,
    action.messagePayload.body.content,
    images
  );

  if (
    action.messagePayload &&
    action.messagePayload.attachment &&
    action.messagePayload.attachments.length > 0
  ) {
    // This sample does not add the MessagePayload Attachments.  This is left as an
    // exercise for the user.
    heroCard.content.subtitle = `(${action.messagePayload.attachments.length} Attachments not included)`;
  }

  const attachment = {
    contentType: heroCard.contentType,
    content: heroCard.content,
    preview: heroCard,
  };

  return {
    composeExtension: {
      type: "result",
      attachmentLayout: "list",
      attachments: [attachment],
    },
  };
}
