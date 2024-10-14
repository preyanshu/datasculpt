type Question = {
    question: string;
    url: string; // Empty for Set 1, has an image URL for Set 2 and Set 3
  };
  
type Answer = string; // Can be a text or an array of URLs for answers

type QuestionSet = {
    question: Question;
    answers: Answer[];
    correctAnswer: Answer;
};


export const set1Questions: QuestionSet[] = [
    {
      question: { question: "What is the capital of France?", url: "" },
      answers: ["Paris", "London", "Rome", "Berlin"],
      correctAnswer: "Paris"
    },
    {
      question: { question: "Which planet is known as the Red Planet?", url: "" },
      answers: ["Mars", "Jupiter", "Saturn", "Venus"],
      correctAnswer: "Mars"
    },
    {
      question: { question: "Who wrote 'Pride and Prejudice'?", url: "" },
      answers: ["Jane Austen", "Charles Dickens", "Mark Twain", "Leo Tolstoy","Leo Tolstoy","Leo Tolstoy","Leo Tolstoy","Leo Tolstoy","Leo Tolstoy"],
      correctAnswer: "Jane Austen"
    }
  ];
  
export const set2Questions: QuestionSet[] = [
    {
      question: { question: "Identify this famous painting:", url: "https://example.com/mona-lisa.jpg" },
      answers: ["The Starry Night", "Mona Lisa", "The Scream", "The Persistence of Memory"],
      correctAnswer: "Mona Lisa"
    },
    {
      question: { question: "Which company logo is this?", url: "https://example.com/apple-logo.png" },
      answers: ["Google", "Apple", "Microsoft", "Amazon"],
      correctAnswer: "Apple"
    },
    {
      question: { question: "Name the species of this animal:", url: "https://example.com/penguin.jpg" },
      answers: ["Penguin", "Dolphin", "Kangaroo", "Polar Bear"],
      correctAnswer: "Penguin"
    }
  ];

export const set3Questions: QuestionSet[] = [
    {
      question: { question: "Choose the best model", url: "https://images.fineartamerica.com/images-medium-large-5/1-portrait-of-beautiful-female-model-on-light-blue-background-anton-oparin.jpg" },
      answers: [
        "https://images.fineartamerica.com/images-medium-large-5/1-portrait-of-beautiful-female-model-on-light-blue-background-anton-oparin.jpg",
        "https://images.fineartamerica.com/images-medium-large-5/open-hart-women-anton-oparin.jpg",
        "https://as2.ftcdn.net/v2/jpg/01/00/12/87/1000_F_100128726_dEnBDrNyMBB7oZhxQXrekY4Afsupu6xN.jpg",
        "https://as1.ftcdn.net/v2/jpg/06/99/93/76/1000_F_699937686_OmXQdIt1TVU1oQ8I4HxQHgqc8VnfhhPF.jpg"
      ],
      correctAnswer: "https://example.com/japan-flag.jpg"
    },
    {
      question: { question: "Which car logo is this?", url: "https://example.com/tesla-logo.jpg" },
      answers: [
        "https://example.com/tesla-logo.jpg",
        "https://example.com/bmw-logo.jpg",
        "https://example.com/ford-logo.jpg",
        "https://example.com/audi-logo.jpg"
      ],
      correctAnswer: "https://example.com/tesla-logo.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    },
    {
      question: { question: "Recognize this fruit:", url: "https://example.com/banana.jpg" },
      answers: [
        "https://example.com/apple.jpg",
        "https://example.com/banana.jpg",
        "https://example.com/orange.jpg",
        "https://example.com/strawberry.jpg"
      ],
      correctAnswer: "https://example.com/banana.jpg"
    }
  ];
  
