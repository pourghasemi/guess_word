export interface User {
    id: string;
    name: string;
  }
  export  type ResponseType = "Yes" | "No" | null
  export  type QuestionType = { question: string, response: ResponseType }
  export  type GameType = { questions: QuestionType[], questionCount: number, category: string, selectedWord: string, player1: User | null, player2: User | null, winner: User | null, timeLeft: number }
  