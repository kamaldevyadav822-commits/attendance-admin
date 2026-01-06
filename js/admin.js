const BACKEND = "https://attendance-backend-5f7f.onrender.com";
let teacherId = localStorage.getItem("teacher_id");

// ---------- MENU ----------
function toggleMenu() {
  sidebar.classList.toggle("-translate-x-full");
}

function showDashboard() {
  students.classList.add("hidden");
  dashboard.classList.remove("hidden");
  toggleMenu();
}

function showStudents() {
  dashboard.classList.add("hidden");
  students.classList.remove("hidden");
  loadStudents();
  toggleMenu();
}

// ---------- LOGIN STATE ----------
if (!teacherId) {
  location.href = "login.html";
}

// ---------- START SESSION ----------
function startSession() {
  startBtn.disabled = true;
  startBtn.innerText = "Starting...";

  fetch(`${BACKEND}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teacher_id: teacherId,
      department: dept.value,
      duration_minutes: duration.value
    })
  })
    .then(r => r.json())
    .then(d => {
      alert(d.session_id || d.error);
      startBtn.innerText = "Start";
      startBtn.disabled = false;
    });
}

// ---------- LOAD HISTORY ----------
function loadHistory() {
  viewBtn.disabled = true;
  viewBtn.innerText = "Loading...";

  fetch(`${BACKEND}/api/admin/history?teacher_id=${teacherId}&department=${dept.value}&date=${date.value}`)
    .then(r => r.json())
    .then(rows => {
      table.innerHTML = "";
      rows.forEach(r => {
        table.innerHTML += `
          <tr class="border-b">
            <td class="p-2">${r.name}</td>
            <td class="p-2">${r.roll_no}</td>
            <td class="p-2">${r.status}</td>
          </tr>`;
      });
      viewBtn.innerText = "View Attendance";
      viewBtn.disabled = false;
    });
}

// ---------- STUDENTS ----------
function loadStudents() {
  studentsList.innerHTML = "Loading...";

  fetch(`${BACKEND}/api/admin/students?teacher_id=${teacherId}`)
    .then(r => r.json())
    .then(rows => {
      studentsList.innerHTML = "";
      rows.forEach(s => {
        studentsList.innerHTML += `
          <div class="bg-white p-2 mb-2 flex justify-between">
            <div>${s.name} (${s.department})</div>
            <button onclick="removeStudent('${s.student_id}')" class="text-red-600">Remove</button>
          </div>`;
      });
    });
}

function removeStudent(id) {
  if (!confirm("Remove this student?")) return;

  fetch(`${BACKEND}/api/admin/students/${id}?teacher_id=${teacherId}`, {
    method: "DELETE"
  }).then(() => loadStudents());
}
