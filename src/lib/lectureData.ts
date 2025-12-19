export interface LectureWeek {
  week: number;
  dates: string;
  topics: string[];
  homework: string;
}

export const lectureSchedule: LectureWeek[] = [
  {
    week: 0,
    dates: "Aug 28",
    topics: ["Introduction", "Administrivia"],
    homework: "hw0"
  },
  {
    week: 1,
    dates: "Sep 2, 4",
    topics: ["Basic Principles", "Optimization (SGD, momentum)"],
    homework: "hw1"
  },
  {
    week: 2,
    dates: "Sep 9, 11",
    topics: ["Optimization (Adam, local linearity)", "Optimizers"],
    homework: "hw2"
  },
  {
    week: 3,
    dates: "Sep 16, 18",
    topics: ["Matrix norms", "muP parameterization"],
    homework: "hw3"
  },
  {
    week: 4,
    dates: "Sep 23, 25",
    topics: ["MuON optimizers", "CNN basics"],
    homework: "hw4"
  },
  {
    week: 5,
    dates: "Sep 30, Oct 2",
    topics: ["Pooling, data augmentation, normalization", "Dropout, ResNets"],
    homework: "hw5"
  },
  {
    week: 6,
    dates: "Oct 7, 9",
    topics: ["ResNets, fully convolutional nets, U-nets", "GNNs"],
    homework: "hw6"
  },
  {
    week: 7,
    dates: "Oct 14, 16",
    topics: ["DiffPool, GNNs, RNNs", "RNNs and self-supervision"],
    homework: "hw7"
  },
  {
    week: 8,
    dates: "Oct 21, 23",
    topics: ["Self-supervision", "State-space models"],
    homework: "hw8"
  },
  {
    week: 9,
    dates: "Oct 28, 30",
    topics: ["Attention and Transformers"],
    homework: "hw9"
  },
  {
    week: 10,
    dates: "Nov 4, 6",
    topics: ["Transformers", "In-context learning, PEFT"],
    homework: "hw10"
  },
  {
    week: 11,
    dates: "Nov 11, 13",
    topics: ["Veterans Day break", "Transfer learning"],
    homework: "hw11"
  },
  {
    week: 12,
    dates: "Nov 18, 20",
    topics: ["Meta-learning", "Generative models"],
    homework: "hw12"
  },
  {
    week: 13,
    dates: "Nov 25, 27",
    topics: ["Post-training", "Thanksgiving break"],
    homework: "hw13"
  },
  {
    week: 14,
    dates: "Dec 2, 4",
    topics: ["Generative models"],
    homework: "hw14"
  }
];
