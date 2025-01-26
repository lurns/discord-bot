const updateSubDate = async (updatedSubs) => {
  for (var sub of updatedSubs) {
    let subDate = new Date(sub.renewalDay);

    switch (sub.renewalCycle) {
      case "monthly":
        subDate.setMonth(subDate.getMonth() + 1);
        break;
      case "annually":
        subDate.setFullYear(subDate.getFullYear() + 1);
        break;
      default: // leave the date the same
        break;
    }
    sub.renewalDay = subDate.toLocaleDateString();

    await fetch(`${process.env.SUBS_SHEETY_URL}/${sub.id}`, {
      method: 'PUT',
      body: JSON.stringify({ subscription: sub }),
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.SUBS_SHEETY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })
    .catch(err => console.error(err));
  }
}

export const fetchSubs = async () => {
  // get subscriptions from google sheet
  const res = await fetch(process.env.SUBS_SHEETY_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${process.env.SUBS_SHEETY_TOKEN}`
    }
  })
  .then(response => response.json())
  .catch(err => console.error(err));

  // check for subs renewing today
  const today = new Date().toLocaleDateString();

  let subsRenewing = [];

  for (var sub of res.subscriptions) {
    const subDate = new Date(sub.renewalDay).toLocaleDateString();

    if (today == subDate) subsRenewing.push(sub);
  }

  // format message
  if (subsRenewing.length > 0) {
    let subEmbed = {
      color: 0xff7a7a,
      title: `Heads up! ${subsRenewing.length} subscription(s) are renewing soon! 💸`,
      description: ''
    }

    for (var sub of subsRenewing) {
      subEmbed.description += `📆 ${sub.subscription} \n`
    }

    // update subscription dates in google sheet
    await updateSubDate(subsRenewing);

    return subEmbed;
  }
}