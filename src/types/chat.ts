export interface Message {
    id: string;
    message: string;
    sender: {
      image: string;
      is_kyc_verified: boolean;
      self: boolean;
      user_id: string;
    };
    time: string;
  }
  
  export interface ChatState {
    from: string;
    to: string;
    name: string;
    messages: Message[];
    currentPage: number;
    isLoading: boolean;
    error: string | null;
  }