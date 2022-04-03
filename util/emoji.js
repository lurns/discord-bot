export const weatherEmoji = (typeId) => {

  switch (typeId.charAt(0)) {
    case '2':
      return `⛈`
    case '3':
      return `🌧`
    case '5':
      return `🌧☔️`
    case '6':
      return `☃️`
    case '7':
      if (typeId === '781') {
        return `🌪`
      }
      return `🌫`
    case '8':
      if (typeId === '800') {
        return `☀️`
      }
      return `☁️`
    default:
      return `🧙‍♂️`
  }
}

export const taskEmoji = (status) => {
  switch (status) {
    case 'Completed':
      return `🥳`
    case 'To Do':
      return `👀`
    default:
      return `👷🏽‍♀️`
  }
}