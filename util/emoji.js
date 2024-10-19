// ref: https://docs.tomorrow.io/reference/data-layers-weather-codes

export const weatherEmoji = (typeId) => {

  switch (typeId.toString().charAt(0)) {
    case '1': // clear & sunny || fog
      if (typeId === 1000 || typeId === 1100) return `☀️`
      return `☁️`
    case '2': // fog
      return `🌫`
    case '4': // rain || heavy rain
      if (typeId < 4201) return `🌧️`
      return `☔️`
    case '5': // snow || heavy snow
      if (typeId < 5101) return `🌨️`
      return `☃️`
    case '6': // freezing rain
      return `❄️☔️`
    case '7': // ice
      return `❄️`
    case '8': // thunderstorm
      return `⛈️`
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