// SM-2 spaced-repetition algorithm (the classic SuperMemo-2).
// Given a card's current state and the recall quality, compute the next state:
// updated ease factor, interval (days), repetition count, and due date.
//
// quality: 0..5  (0 = total blackout, 5 = perfect recall)

function sm2(state, quality) {
  let easeFactor = state && state.easeFactor != null ? state.easeFactor : 2.5;
  let intervalDays = state && state.intervalDays != null ? state.intervalDays : 0;
  let repetitions = state && state.repetitions != null ? state.repetitions : 0;

  if (quality < 3) {
    // Failed recall → reset the schedule, review again tomorrow.
    repetitions = 0;
    intervalDays = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 6;
    else intervalDays = Math.round(intervalDays * easeFactor);
  }

  // Update ease factor (clamped to a 1.3 floor).
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const dueDate = new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
  return {
    easeFactor: Number(easeFactor.toFixed(2)),
    intervalDays,
    repetitions,
    dueDate,
  };
}

// Map the app's 1–4 confidence (Forgot / Hard / Good / Easy, collected by
// ResultSection) onto SM-2's 0–5 quality scale.
function confidenceToQuality(score) {
  return { 1: 1, 2: 3, 3: 4, 4: 5 }[score] ?? 3;
}

module.exports = { sm2, confidenceToQuality };
