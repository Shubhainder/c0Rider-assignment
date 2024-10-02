export const formatMessageDate = (timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
  
    const formatDateString = (date: Date): string => {
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    };
  
    const messageDateStr = formatDateString(messageDate);
    const todayStr = formatDateString(today);
    const yesterdayStr = formatDateString(yesterday);
  
    if (messageDateStr === todayStr) {
      return 'Today';
    } else if (messageDateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };