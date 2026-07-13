import { grammar } from "./grammar";
import { topics } from "./topics";
import { vocabDomains } from "./vocab";
import { grammarExercises, vocabClozes } from "./exercises";

export const level1 = {
  id: "1" as const,
  topics,
  grammar,
  vocabDomains,
  grammarExercises,
  vocabClozes,
};

export { grammar, topics, vocabDomains, grammarExercises, vocabClozes };
export {
  getTopic,
} from "./topics";
export {
  getGrammar,
  getGrammarByTopic,
} from "./grammar";
export {
  getDomain,
  getWord,
} from "./vocab";
export {
  getGrammarExercises,
  getTopicExercises,
  getDomainClozes,
} from "./exercises";
