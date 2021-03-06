export const weatherEmoji = (typeId) => {

  switch (typeId.charAt(0)) {
    case '2':
      return `โ`
    case '3':
      return `๐ง`
    case '5':
      return `๐งโ๏ธ`
    case '6':
      return `โ๏ธ`
    case '7':
      if (typeId === '781') {
        return `๐ช`
      }
      return `๐ซ`
    case '8':
      if (typeId === '800') {
        return `โ๏ธ`
      }
      return `โ๏ธ`
    default:
      return `๐งโโ๏ธ`
  }
}

export const taskEmoji = (status) => {
  switch (status) {
    case 'Completed':
      return `๐ฅณ`
    case 'To Do':
      return `๐`
    default:
      return `๐ท๐ฝโโ๏ธ`
  }
}