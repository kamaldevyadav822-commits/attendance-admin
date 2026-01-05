const BACKEND = "https://attendance-backend.onrender.com";

let teacherId = null;

function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

// LOGIN
function login() {
  showLoader(true);
  fetch(`${BACKEND}/api/teacher/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
  .then(r => r.json())
  .then(d => {
    showLoader(false);
    if (d.teacher_id) {
      teacherId = d.teacher_id;
      loginBox.classList.add("hidden");
      dashboard.classList.remove("hidden");
    } else {
      loginError.innerText = d.error;
    }
  });
}

// START SESSION
function startSession() {
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
  .then(d => alert(d.session_id || d.error));
}

// QR GENERATION
function generateQR() {
  fetch(`${BACKEND}/api/admin/qr?teacher_id=${teacherId}`)
    .then(r => r.json())
    .then(d => {
      qrBox.innerHTML = `
        <img class="border p-2"
        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(d.qr_url)}">
      `;
    });
}

// HISTORY
function loadHistory() {
  showLoader(true);
  fetch(`${BACKEND}/api/admin/history?teacher_id=${teacherId}&department=${dept.value}&date=${date.value}`)
    .then(r => r.json())
    .then(rows => {
      showLoader(false);
      table.innerHTML = "<tr class='border'><th>Name</th><th>Roll</th><th>Status</th></tr>";
      rows.forEach(r => {
        table.innerHTML += `<tr class='border'>
          <td>${r.name}</td>
          <td>${r.roll_no}</td>
          <td>${r.status}</td>
        </tr>`;
      });
    });
}

// EXCEL EXPORT
function exportExcel() {
  window.open(
    `${BACKEND}/api/admin/export?teacher_id=${teacherId}&department=${dept.value}&date=${date.value}`,
    "_blank"
  );
}
