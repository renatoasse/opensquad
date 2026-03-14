import { createInterface } from 'node:readline';

/**
 * Prompt the user for a yes/no confirmation.
 * Accepts 'y' (English) or 's' (Portuguese "sim").
 */
export async function confirm(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

/**
 * Check if user answered affirmatively.
 */
export function isYes(answer) {
  return answer === 'y' || answer === 's';
}
