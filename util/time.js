// time should be between 9am - 11:45am, or 1:45pm - 3:45pm
export const rollDanceTime = () => {
    let hour;
    let minute;
    let danceTime = new Date();

    // determine whether it will be morn (0) or afternoon (1)
    const timeOfDay = Math.floor(Math.random() * 2);

    // morning
    if (timeOfDay === 0) {
        // pick hour between 9-11
        hour = Math.floor(Math.random() * (11 - 9) + 9);

        // pick minute between 0-45 for hour 11, or 0-59 for hour 9-10
        minute = hour === 11 ? Math.floor(Math.random() * (45 - 0) + 0) : Math.floor(Math.random() * (59 - 0) + 0);
    }

    // afternoon
    if (timeOfDay === 1) {
        // pick hour between 1-3
        hour = Math.floor(Math.random() * (15 - 13) + 13);

        // pick minute between 0-59 for hour 2, or 0-45 for hour 1 or 3
        minute = hour === 14 ? Math.floor(Math.random() * (59 - 0) + 0) : Math.floor(Math.random() * (45 - 0) + 0);
    }

    // set the time
    danceTime.setHours(hour);
    danceTime.setMinutes(minute);

    return danceTime;
}