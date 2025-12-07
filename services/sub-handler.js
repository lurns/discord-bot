import { readSheet, updateRow, rowsToObjects } from "../util/sheets.js";

const updateSubDate = async (updatedSubs) => {
  for (const sub of updatedSubs) {
    let subDate = new Date(sub['Renewal Day']);

    switch (sub['Renewal Cycle']) {
      case "monthly":
        subDate.setMonth(subDate.getMonth() + 1);
        break;
      case "annually":
        subDate.setFullYear(subDate.getFullYear() + 1);
        break;
      default: // leave the date the same
        break;
    }
    const newRenewalDay = subDate.toLocaleDateString();

    // update google sheet using subscription name as unique key
    await updateRow(
      "subscriptions",
      "Subscription", 
      sub.Subscription,
      { ['Renewal Day']: newRenewalDay }
    );
  }
};

export const fetchSubs = async () => {
  // get all rows from the "subscriptions" sheet
  const rows = await readSheet("subscriptions");
  if (!rows.length) return;

  const subs = rowsToObjects(rows);

  // check for subs renewing today
  const today = new Date().toLocaleDateString();

  let subsRenewing = [];

  for (const sub of subs) {
    const subDate = new Date(sub['Renewal Day']).toLocaleDateString();
    if (today === subDate) subsRenewing.push(sub);
  }

  // format message
  if (subsRenewing.length > 0) {
    let subEmbed = {
      color: 0xff7a7a,
      title: `Heads up! ${subsRenewing.length} subscription(s) are renewing soon! 💸`,
      description: ''
    };

    for (const sub of subsRenewing) {
      subEmbed.description += `📆 ${sub.subscription} \n`;
    }

    // update subscription dates in google sheet
    await updateSubDate(subsRenewing);

    return subEmbed;
  }
};