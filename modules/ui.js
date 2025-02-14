export function updateWeekDisplay(weekNumber, dateRange) {
    document.getElementById('currentWeekDisplay').textContent = `Week ${weekNumber} (${dateRange})`;
}

export function populateScheduleForm(schedule) {

  const warmupSelect = document.getElementById('warmup');
  const exercise1Select = document.getElementById('exercise1');
  const exercise2Select = document.getElementById('exercise2');
  const exercise3Select = document.getElementById('exercise3');
  const mainActivitySelect = document.getElementById('mainActivity');
  const cooldownSelect = document.getElementById('cooldown');
  const leadersInput = document.getElementById('leaders');

  // Set values, handling potential null values
  warmupSelect.value = schedule.warmup || '';
  exercise1Select.value = schedule.exercise1 || '';
  exercise2Select.value = schedule.exercise2 || '';
  exercise3Select.value = schedule.exercise3 || '';
  mainActivitySelect.value = schedule.mainActivity || '';
  cooldownSelect.value = schedule.cooldown || '';
  leadersInput.value = schedule.leaders || '';
}

export function getScheduleFormData() {
     return {
      warmup: document.getElementById('warmup').value,
      exercise1: document.getElementById('exercise1').value,
      exercise2: document.getElementById('exercise2').value,
      exercise3: document.getElementById('exercise3').value,
      mainActivity: document.getElementById('mainActivity').value,
      cooldown: document.getElementById('cooldown').value,
      leaders: document.getElementById('leaders').value
    };
}
export function clearScheduleForm() {
      const fields = ['warmup', 'exercise1', 'exercise2', 'exercise3', 'mainActivity', 'cooldown', 'leaders'];
      fields.forEach(field => {
        const element = document.getElementById(field);
        if (element.tagName === 'SELECT') {
          element.value = ''; // Clear dropdowns
        } else {
          element.value = ''; // Clear other inputs (like leaders)
        }
    });
}

export function showAppContent() {
    document.getElementById('authSection').classList.add('hidden');
    document.getElementById('appContent').classList.remove('hidden');
}

export function hideElement(element) {
    element.classList.add('hidden');
}

export function showElement(element) {
    element.classList.remove('hidden');
}