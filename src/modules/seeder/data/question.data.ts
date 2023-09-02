interface QuestionData {
  type: string;
  topic: string;
  label: string;
  tags: string[];
}

const questionData: Array<QuestionData> = [
  {
    topic: 'sleep',
    type: 'rating',
    label: 'How was your sleep last night?',
    tags: ['pre_session', 'health'],
  },
  {
    topic: 'energy',
    type: 'rating',
    label: 'How is your energy level today?',
    tags: ['pre_session', 'health'],
  },
  {
    topic: 'anxiety',
    type: 'rating',
    label: 'How is your anxiety level today?',
    tags: ['pre_session', 'health'],
  },
  {
    topic: 'dizziness',
    type: 'yes_no',
    label: 'Dizziness',
    tags: ['post_session'],
  },
  {
    topic: 'nausea',
    type: 'yes_no',
    label: 'Nausea',
    tags: ['post_session', 'negative_effect'],
  },
  {
    topic: 'tunnel_vision',
    type: 'yes_no',
    label: 'Tunnel vision',
    tags: ['post_session', 'negative_effect'],
  },
  {
    topic: 'unpleasant_hearing_sensitive',
    type: 'yes_no',
    label: 'Unpleasant increase in hearing sensitivity',
    tags: ['post_session', 'negative_effect'],
  },
  {
    topic: 'trembling_body',
    type: 'yes_no',
    label: 'Shaking or trembling in any part of the body',
    tags: ['post_session', 'negative_effect'],
  },
  {
    topic: 'trembling_body',
    type: 'yes_no',
    label: 'Shaking or trembling in any part of the body',
    tags: ['post_session', 'negative_effect'],
  },
  {
    topic: 'seperation_thought',
    type: 'yes_no',
    label: 'Inner separation from thoughts',
    tags: ['post_session', 'positive_effect'],
  },
  {
    topic: 'mind_quieter',
    type: 'yes_no',
    label: 'Feeling as if your mind get quieter',
    tags: ['post_session', 'positive_effect'],
  },
  {
    topic: 'awareness_body',
    type: 'yes_no',
    label: 'Increased awareness of your body',
    tags: ['post_session', 'positive_effect'],
  },
];

export default questionData;
