import { TeamsInfo } from "botbuilder";

export const getNamesOfTeamMembers = async (context) => {
  let continuationToken;
  let members = [];
  do {
    let pagedMembers = await TeamsInfo.getPagedMembers(
      context,
      500,
      continuationToken
    );
    continuationToken = pagedMembers.continuationToken;
    members.push(...pagedMembers.members);
  } while (continuationToken !== undefined);
  console.log(members);
  return members;
};
