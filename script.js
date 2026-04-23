/* -----------------------
           Navigation + init
   ----------------------- */
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
showSection('diet'); // default open

/* -----------------------
          Diet Plan
   ----------------------- */
// ... [Your existing Diet JS remains unchanged] ...

// DOM elements
const dietDaySelect = document.getElementById('dietDaySelect');
const mealInputs = document.getElementById('mealInputs');
const actionButtons = document.getElementById('actionButtons');
const saveBtn = document.getElementById('saveDietBtn');
const editBtn = document.getElementById('editDietBtn');
const dietList = document.getElementById('dietList');
const selectedDayTitle = document.getElementById('selectedDayTitle');

const breakfastInput = document.getElementById('breakfastInput');
const lunchInput = document.getElementById('lunchInput');
const dinnerInput = document.getElementById('dinnerInput');
const snacksInput = document.getElementById('snacksInput');
const proteinGoalInput = document.getElementById('proteinGoal');

let selectedDay = "";

/* Helpers */
function getDietPlans() {
    return JSON.parse(localStorage.getItem('dietPlans') || '{}');
}
function setDietPlans(obj) {
    localStorage.setItem('dietPlans', JSON.stringify(obj));
}
function hasSavedPlan(obj) {
    if (!obj) return false;
    return Object.values(obj).some(v => v !== null && v !== undefined && String(v).trim() !== '');
}

/* Update UI depending on whether day has saved plan */
function updateUIForDay(day) {
    const dietPlans = getDietPlans();
    // show the title
    if (!day) {
        selectedDayTitle.textContent = '';
        dietList.innerHTML = '';
        mealInputs.style.display = 'none';
        actionButtons.style.display = 'none';
        return;
    }

    selectedDayTitle.textContent = day + ' Diet Plan:';
    const plan = dietPlans[day];

    if (plan && hasSavedPlan(plan)) {
        // If saved -> show saved items only + show Edit button (hide inputs and Save)
        mealInputs.style.display = 'none';
        actionButtons.style.display = 'flex';
        saveBtn.style.display = 'none';
        editBtn.style.display = 'inline-block';
        renderSavedPlan(day, plan);
    } else {
        // No saved plan -> show inputs and Save button (hide edit)
        mealInputs.style.display = 'block';
        actionButtons.style.display = 'flex';
        saveBtn.style.display = 'inline-block';
        editBtn.style.display = 'none';
        dietList.innerHTML = ''; // no saved items
        // Clear inputs so user can enter new content
        clearInputs();
    }
}

/* render saved plan into the dietList */
function renderSavedPlan(day, plan) {
    dietList.innerHTML = '';
    if (!plan) return;
    const order = ['breakfast', 'lunch', 'dinner', 'snacks'];
    order.forEach(meal => {
        const val = plan[meal];
        if (val && String(val).trim() !== '') {
            const li = document.createElement('li');
            li.innerHTML = `<b>${meal}:</b> ${escapeHtml(val)}`;
            dietList.appendChild(li);
        }
    });
}

/* Save handler */
function saveDiet() {
    if (!selectedDay) {
        alert('Please select a day first.');
        return;
    }
    const dietPlans = getDietPlans();

    const newPlan = {
        breakfast: breakfastInput.value.trim(),
        lunch: lunchInput.value.trim(),
        dinner: dinnerInput.value.trim(),
        snacks: snacksInput.value.trim()
    };

    // Store only if something entered; but still save empty if user wants
    dietPlans[selectedDay] = newPlan;
    setDietPlans(dietPlans);

    // persist protein goal
    localStorage.setItem('proteinGoal', (proteinGoalInput.value || '').trim());

    // After saving we hide inputs and show only Edit
    updateUIForDay(selectedDay);
}

/* Edit handler: populate inputs and show Save */
function enableEdit() {
    if (!selectedDay) return;
    const dietPlans = getDietPlans();
    const plan = dietPlans[selectedDay] || { breakfast: '', lunch: '', dinner: '', snacks: '' };

    breakfastInput.value = plan.breakfast || '';
    lunchInput.value = plan.lunch || '';
    dinnerInput.value = plan.dinner || '';
    snacksInput.value = plan.snacks || '';

    // Show inputs, show Save, hide Edit
    mealInputs.style.display = 'block';
    saveBtn.style.display = 'inline-block';
    editBtn.style.display = 'none';
    // clear displayed saved list (optional)
    // dietList.innerHTML = '';
}

/* Utility to clear inputs */
function clearInputs() {
    breakfastInput.value = '';
    lunchInput.value = '';
    dinnerInput.value = '';
    snacksInput.value = '';
}

/* When the day selection changes */
dietDaySelect.addEventListener('change', () => {
    selectedDay = dietDaySelect.value;
    updateUIForDay(selectedDay);
});

/* Wire buttons */
saveBtn.addEventListener('click', saveDiet);
editBtn.addEventListener('click', enableEdit);

/* Escape HTML to prevent accidental markup in saved meals display */
function escapeHtml(unsafe) {
    if (unsafe === null || unsafe === undefined) return '';
    return String(unsafe)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

/* Load proteinGoal and initial UI on start */
document.addEventListener('DOMContentLoaded', () => {
    const p = localStorage.getItem('proteinGoal') || '';
    proteinGoalInput.value = p;
    // Start with no day selected (user chooses). If you prefer auto-select a day,
    // set dietDaySelect.value = 'Monday' and then call updateUIForDay('Monday').
    updateUIForDay('');
});

/* Save protein goal as user types (optional convenience) */
proteinGoalInput.addEventListener('change', () => {
    localStorage.setItem('proteinGoal', proteinGoalInput.value.trim());
});



/* -----------------------
          Workout Plan
   ----------------------- */
// ... [Your existing Workout Plan JS remains unchanged] ...

/* Workout Plan (with Add + Remove system, 2-sets only) */
const workoutInput = document.getElementById("workoutInput");
const workoutList = document.getElementById("workoutList");
const todayTitle = document.getElementById("todayTitle");
const daySelect = document.getElementById("daySelect");

// Add Remove button under workout section (like Edit Diet button)
const removeBtn = document.createElement("button");
removeBtn.textContent = "Remove Workout";
removeBtn.id = "removeWorkoutBtn";
removeBtn.style.display = "inline-block";
removeBtn.style.marginTop = "10px";
removeBtn.style.padding = "6px 12px";
removeBtn.style.borderRadius = "6px";
removeBtn.style.background = "#f44336";
removeBtn.style.color = "white";
removeBtn.style.border = "none";
removeBtn.style.cursor = "pointer";
workoutList.parentNode.insertBefore(removeBtn, workoutList.nextSibling);

let removeMode = false; // toggle flag

// Safe JSON parse
function safeParse(key) {
    try {
        return JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
        return {};
    }
}
function getWorkoutsObj() {
    const parsed = safeParse('workouts');
    return (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) ? parsed : {};
}
function setWorkoutsObj(obj) {
    localStorage.setItem('workouts', JSON.stringify(obj));
}

/* Add workout */
function addWorkout() {
    const day = (daySelect.value || '').trim();
    const workoutName = (workoutInput.value || '').trim();
    if (!day) {
        alert('Please select a day first.');
        return;
    }
    if (!workoutName) return;

    const workouts = getWorkoutsObj();
    if (!Array.isArray(workouts[day])) workouts[day] = [];

    workouts[day].push({ name: workoutName, sets: [false, false] });

    setWorkoutsObj(workouts);
    workoutInput.value = '';
    showWorkouts(day);
}

/* Calc progress */
function calcProgress(sets) {
    if (!Array.isArray(sets) || sets.length === 0) return 0;
    const done = sets.filter(Boolean).length;
    return Math.round((done / sets.length) * 100);
}

/* Render workouts */
function showWorkouts(day) {
    const workouts = getWorkoutsObj();
    workoutList.innerHTML = '';

    if (!day || !Array.isArray(workouts[day]) || workouts[day].length === 0) return;

    let migrated = false;
    workouts[day] = workouts[day].map(item => {
        if (typeof item === 'string') {
            migrated = true;
            return { name: item, sets: [false, false] };
        } else if (item && typeof item === 'object') {
            if (!Array.isArray(item.sets) || item.sets.length === 0) {
                migrated = true;
                item.sets = [false, false];
            }
            return item;
        } else {
            migrated = true;
            return { name: String(item || ''), sets: [false, false] };
        }
    });
    if (migrated) setWorkoutsObj(workouts);

    workouts[day].forEach((w, index) => {
        const wrapper = document.createElement('div');
        wrapper.style.marginBottom = '12px';
        wrapper.style.padding = '10px';
        wrapper.style.borderRadius = '8px';
        wrapper.style.background = '#fafafa';
        wrapper.style.border = '1px solid #e0e0e0';

        const percent = calcProgress(w.sets);

        // Header
        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';

        const nameEl = document.createElement('strong');
        nameEl.style.fontSize = '15px';
        nameEl.textContent = w.name;

        header.appendChild(nameEl);

        // only show % if not in remove mode
        if (!removeMode) {
            const percentEl = document.createElement('span');
            percentEl.style.fontSize = '14px';
            percentEl.textContent = `${percent}%`;
            header.appendChild(percentEl);
        }

        wrapper.appendChild(header);


        // Sets
        w.sets.forEach((done, setIndex) => {
            const setRow = document.createElement('div');
            setRow.style.display = 'flex';
            setRow.style.alignItems = 'center';
            setRow.style.marginLeft = '8px';
            setRow.style.marginBottom = '6px';

            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = Boolean(done);
            chk.style.marginRight = '8px';

            chk.addEventListener('change', () => {
                const refreshed = getWorkoutsObj();
                if (!Array.isArray(refreshed[day])) refreshed[day] = [];
                const item = refreshed[day][index];
                if (!item || typeof item !== 'object') {
                    refreshed[day][index] = { name: w.name, sets: [false, false] };
                }
                refreshed[day][index].sets[setIndex] = chk.checked;
                setWorkoutsObj(refreshed);
                showWorkouts(day);
            });

            const label = document.createElement('label');
            label.style.userSelect = 'none';
            label.appendChild(chk);
            label.appendChild(document.createTextNode(`Set ${setIndex + 1}`)); // ✅ removed percentage

            setRow.appendChild(label);
            wrapper.appendChild(setRow);
        });


        if (removeMode) {
            const removeRow = document.createElement('div');
            removeRow.style.marginTop = '8px';
            removeRow.style.display = 'flex';
            removeRow.style.justifyContent = 'flex-end'; // ✅ push to right

            const removeChk = document.createElement('input');
            removeChk.type = 'checkbox';
            removeChk.dataset.index = index;
            removeChk.classList.add('removeChk');

            // style it big and red
            removeChk.style.width = "26px";
            removeChk.style.height = "26px";
            removeChk.style.accentColor = "red";
            removeChk.style.cursor = "pointer";

            removeRow.appendChild(removeChk);
            wrapper.appendChild(removeRow);
        }



        workoutList.appendChild(wrapper);
    });
}

/* Toggle remove mode */
removeBtn.addEventListener("click", () => {
    if (!daySelect.value) {
        alert("Please select a day first.");
        return;
    }

    if (!removeMode) {
        removeMode = true;
        removeBtn.textContent = "Confirm Removal";
    } else {
        // Perform removal
        const workouts = getWorkoutsObj();
        const day = daySelect.value;
        const checkboxes = document.querySelectorAll(".removeChk:checked");
        const indexesToRemove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.index));
        if (indexesToRemove.length > 0) {
            workouts[day] = workouts[day].filter((_, idx) => !indexesToRemove.includes(idx));
            setWorkoutsObj(workouts);
        }
        removeMode = false;
        removeBtn.textContent = "Remove Workout";
    }
    showWorkouts(daySelect.value);
});

/* Load today */
function loadTodayWorkout() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const todayName = days[new Date().getDay()];
    todayTitle.textContent = "Today (" + todayName + ") Workouts:";
    showWorkouts(todayName);
}

/* On select */
daySelect.addEventListener("change", function () {
    const selectedDay = this.value;
    todayTitle.textContent = (selectedDay ? selectedDay : '') + " Workouts:";
    showWorkouts(selectedDay);
});

todayTitle.textContent = "";
showWorkouts(""); // start empty until user chooses a day


/* -----------------------
      Workout Variations
   ----------------------- */

// ========== VARIATIONS SECTION ==========

// Elements
const categoryBoxes = document.getElementById("categoryBoxes");
const categoryDetail = document.getElementById("categoryDetail");
const backToCategories = document.getElementById("backToCategories");
const selectedCategoryTitle = document.getElementById("selectedCategoryTitle");
const variationsList = document.getElementById("variationsList");
const showAddFormBtn = document.getElementById("showAddFormBtn");
const addVariationForm = document.getElementById("addVariationForm");

const variationName = document.getElementById("variationName");
const variationImage = document.getElementById("variationImage");
const variationVideo = document.getElementById("variationVideo");
const variationLink = document.getElementById("variationLink");
const addVariationBtn = document.getElementById("addVariationBtn");

let selectedCategory = "";

// ---------------- Storage helpers ----------------
function getVariations() {
    return JSON.parse(localStorage.getItem("variations") || "{}");
}
function setVariations(obj) {
    localStorage.setItem("variations", JSON.stringify(obj));
}

// ---------------- Migration (compatibility with old format) ----------------
function migrateVariations() {
    const data = localStorage.getItem("variations");
    if (!data) return;

    try {
        const parsed = JSON.parse(data);

        // If already in new format (object with categories), skip
        if (typeof parsed === "object" && !Array.isArray(parsed)) return;

        // If old format (array), wrap into "Chest" by default
        if (Array.isArray(parsed)) {
            const newData = { Chest: parsed };
            setVariations(newData);
        }
    } catch (e) {
        console.error("Migration error:", e);
    }
}
migrateVariations();

// ---------------- Render exercises ----------------
function renderVariations() {
    variationsList.innerHTML = "";
    const all = getVariations();
    const arr = all[selectedCategory] || [];

    arr.forEach((v, i) => {
        const card = document.createElement("div");
        card.className = "variation-card";
        card.style.marginBottom = "10px";
        card.style.padding = "10px";
        card.style.border = "1px solid #ccc";
        card.style.borderRadius = "8px";

        card.innerHTML = `
      <strong>${v.name}</strong>
      ${v.image ? `<img src="${v.image}" style="max-width:100%;margin-top:6px;border-radius:6px;"/>` : ""}
      ${v.video ? `<iframe src="${v.video}" frameborder="0" allowfullscreen style="width:100%;height:220px;margin-top:6px;border-radius:6px;"></iframe>` : ""}
      ${v.link ? `<a href="${v.link}" target="_blank" style="display:block;margin-top:6px;">🔗 Link</a>` : ""}
      <button onclick="removeVariation(${i})" style="margin-top:6px;background:#dc3545;color:white;padding:6px 12px;border:none;border-radius:6px;">🗑 Remove</button>
    `;
        variationsList.appendChild(card);
    });
}

// ---------------- Handle category click ----------------
document.querySelectorAll(".category").forEach(box => {
    box.addEventListener("click", () => {
        selectedCategory = box.dataset.cat;
        selectedCategoryTitle.textContent = selectedCategory + " Exercises";

        categoryBoxes.style.display = "none";
        categoryDetail.style.display = "block";
        addVariationForm.style.display = "none"; // keep form hidden
        renderVariations();
    });
});

// ---------------- Back button ----------------
backToCategories.addEventListener("click", () => {
    categoryDetail.style.display = "none";
    categoryBoxes.style.display = "grid";
    selectedCategory = "";
});

// ---------------- Show form button ----------------
showAddFormBtn.addEventListener("click", () => {
    addVariationForm.style.display =
        addVariationForm.style.display === "none" ? "block" : "none";
});

// ---------------- Add new variation ----------------
addVariationBtn.addEventListener("click", () => {
    const name = variationName.value.trim();
    const image = variationImage.value.trim();
    const video = variationVideo.value.trim();
    const link = variationLink.value.trim();

    if (!name) {
        alert("Exercise name required");
        return;
    }

    const all = getVariations();
    if (!all[selectedCategory]) all[selectedCategory] = [];
    all[selectedCategory].push({ name, image, video, link });
    setVariations(all);

    // Clear form + hide
    variationName.value = "";
    variationImage.value = "";
    variationVideo.value = "";
    variationLink.value = "";
    addVariationForm.style.display = "none";

    renderVariations();
});

// ---------------- Remove variation ----------------
function removeVariation(index) {
    const all = getVariations();
    all[selectedCategory].splice(index, 1);
    setVariations(all);
    renderVariations();
}

/* -----------------------
           Timer
   ----------------------- */
// ... [Your existing Timer JS remains unchanged] ...

/* Timer */
/* Timer */
let recognition;
let timerInterval;
let timeLeft = 0;

const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timerDisplay");
const resetBtn = document.getElementById("resetBtn");

// Manual Timer UI
let manualTimerEl = document.getElementById("manualTimer");
if (!manualTimerEl) {
    manualTimerEl = document.createElement("div");
    manualTimerEl.id = "manualTimer";
    manualTimerEl.style.display = "none";
    manualTimerEl.style.marginTop = "12px";
    manualTimerEl.innerHTML = `
        <input type="number" id="manualMinutes" placeholder="Minutes" min="0" style="width:80px;padding:6px;">
        <input type="number" id="manualSeconds" placeholder="Seconds" min="0" max="59" style="width:80px;padding:6px;">
        <button id="manualStartBtn">▶ Start Timer</button>
        <button id="manualResetBtn" style="margin-left:8px;">⏹ Reset</button>
        <div id="manualTimerDisplay" style="margin-top:10px;font-size:20px;">00:00</div>
    `;
    timerEl.insertAdjacentElement("afterend", manualTimerEl);
    document.getElementById("manualStartBtn").addEventListener("click", startManualTimer);
    document.getElementById("manualResetBtn").addEventListener("click", resetManualTimer);
}

// Detect mobile
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// Hide voice UI and show manual only on mobile
if (isMobile) {
    if (statusEl) statusEl.style.display = "none";
    const micBtn = document.getElementById("startMicBtn");
    if (micBtn) micBtn.style.display = "none";
    if (resetBtn) resetBtn.style.display = "none";
    if (timerEl) timerEl.style.display = "none";

    manualTimerEl.style.display = "block";
}

// ---- Helpers ----
function formatTime(secs) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function speak(msg) {
    const utter = new SpeechSynthesisUtterance(msg);
    speechSynthesis.speak(utter);
}

// ---- Manual Timer ----
let manualInterval;
let manualTimeLeft = 0;

function updateManualDisplay() {
    const displayEl = document.getElementById("manualTimerDisplay");
    displayEl.textContent = formatTime(manualTimeLeft);

    if (manualTimeLeft <= 0) {
        clearInterval(manualInterval);
        speak("⏰ Time is up!");
        alert("⏰ Time is up!");
        return;
    }

    // At 10 seconds → speak countdown
    if (manualTimeLeft <= 10) {
        speak(manualTimeLeft.toString());
    }

    manualTimeLeft--;
}

function startManualTimer() {
    clearInterval(manualInterval);
    const mins = parseInt(document.getElementById("manualMinutes").value) || 0;
    const secs = parseInt(document.getElementById("manualSeconds").value) || 0;
    manualTimeLeft = mins * 60 + secs;

    if (manualTimeLeft > 0) {
        const displayEl = document.getElementById("manualTimerDisplay");
        displayEl.textContent = formatTime(manualTimeLeft);

        // Voice feedback at start
        speak(`Time is set for ${mins} minutes ${secs} seconds`);

        manualInterval = setInterval(updateManualDisplay, 1000);
    } else {
        alert("Enter valid minutes or seconds.");
    }
}

function resetManualTimer() {
    clearInterval(manualInterval);
    manualTimeLeft = 0;
    document.getElementById("manualTimerDisplay").textContent = "00:00";
    speak("Timer reset");
}
