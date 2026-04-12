import supabase from "../util/db.js";

const updateSubDate = async (updatedSubs) => {
  const toUpdate = updatedSubs.map(sub => {
    let nextSubDate = new Date(sub.renewal_day);

    let renewalMonths = nextSubDate.getMonth() + sub.renewal_cycle_in_months;
    nextSubDate.setMonth(renewalMonths);

    return { ...sub, renewal_day: nextSubDate };
  });

  const { error } = await supabase.from('subscriptions').upsert(toUpdate);

  if (error) console.error('Error updating subscription dates:', error);
};

export const fetchSubs = async () => {
  // query supabase for subs renewing today
  const { data: subs, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('renewal_day', new Date().toLocaleDateString());

  if (error) {
    console.error('Error fetching subscriptions:', error);
    return;
  }

  if (subs.length > 0) {
    let subEmbed = {
      color: 0xff7a7a,
      title: `Heads up! ${subs.length} ${subs.length === 1 ? 'subscription is' : 'subscriptions are'} renewing soon! 💸`,
      description: ''
    };

    for (const sub of subs) {
      subEmbed.description += `📆 ${sub.subscription} \n`;
    }

    // update subscription dates in db
    await updateSubDate(subs);

    return subEmbed;
  }
};