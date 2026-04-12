import supabase from "../db.js";
import { readSheet } from "../sheets.js";

// fetch all subs from google sheet and add to postgres database
const subs = await readSheet('subscriptions');

// i want to be more flexible with months, so let's 
// convert cycles to month ints when setting up objects
let formattedSubs = subs.map(sub => {
  return {
    subscription: sub[0],
    renewal_day: new Date(sub[1]),
    renewal_cycle_in_months: sub[2] === 'monthly' ? 1 : sub[2] === 'annually' ? 12 : null
  }
});

formattedSubs.shift(); // remove header row

// commit to supabase
const { data, error } = await supabase.from('subscriptions').insert(formattedSubs).select();

if (error) {
  console.error('Error inserting subscriptions:', error);
} else {
  console.log('Subscriptions inserted successfully:', data);
}