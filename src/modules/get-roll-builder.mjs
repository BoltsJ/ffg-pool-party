/**
 * Attempts to retreive the active RollBuilderFFG application with a timeout
 * and retry to avoid a race condition.
 */
export async function getRollBuilder(max_retries = 0) {
  let app = Object.values(ui.windows).find(a => a.hasOwnProperty("dicePool"));
  while (!app && max_retries != 0) {
    await new Promise(resolve => setTimeout(resolve, 50)); // Sleep and try again
    max_retries -= 1;
    app = Object.values(ui.windows).find(a => a.hasOwnProperty("dicePool"));
  }
  return app;
}
