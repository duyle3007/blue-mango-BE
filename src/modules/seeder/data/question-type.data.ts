interface QuestionType {
  key: string;
  description: string;
}

const questionTypes: Array<QuestionType> = [
  {
    key: 'yes_no',
    description: 'Yes / No',
  },
  {
    key: 'rating',
    description: 'rating',
  },
];

export default questionTypes;
