export const fetchChatMessages = async (page: number) => {
    const response = await fetch(`https://qa.corider.in/assignment/chat?page=${page}`)
    const data = await response.json()
    console.log(data)
    return data
  }