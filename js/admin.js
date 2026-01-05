const BACKEND = "https://attendance-backend-5f7f.onrender.com";
let teacherId = null;

// ---------- UI HELPERS ----------
function showLoader(show) {
  loader.classList.toggle("hidden", !show);
}

// ---------- LOGIN ----------
function login() {
  loginError.innerText = "";
  showLoader(true);

  fetch(`${BACKEND}/api/teacher/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })
    .then(res => res.json())
    .then(data => {
      showLoader(false);
      if (data.teacher_id) {
        teacherId = data.teacher_id;
        loginBox.classList.add("hidden");
        dashboard.classList.remove("hidden");
      } else {
        loginError.innerText = data.error || "Login failed";
      }
    })
    .catch(() => {
      showLoader(false);
      loginError.innerText = "Server error";
    });
}

// ---------- LOGOUT ----------
function logout() {
  teacherId = null;
  dashboard.classList.add("hidden");
  loginBox.classList.remove("hidden");
}

// ---------- START SESSION ----------
function startSession() {
  if (!duration.value || duration.value <= 0) {
    alert("Enter valid duration");
    return;
  }

  fetch(`${BACKEND}/api/sessions/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      teacher_id: teacherId,
      department: dept.value,
      duration_minutes: duration.value
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.session_id || data.error);
    });
}

// ---------- GENERATE QR ----------
function generateQR() {
  qrBox.innerHTML = "Generating QR...";

  fetch(`${BACKEND}/api/admin/qr?teacher_id=${teacherId}`)
    .then(res => res.json())
    .then(data => {
      qrBox.innerHTML = `
        <img
          class="border p-2 rounded"
          src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
            data.qr_url
          )}"
        />
      `;
    });
}

// ---------- LOAD HISTORY ----------
function loadHistory() {
  const selectedDate = date.value;

  if (!selectedDate) {
    alert("Please select a date first");
    return;
  }

  showLoader(true);
  table.innerHTML = `
    <tr>
      <td colspan="3" class="p-4 text-center text-gray-500">
        Loading attendance...
      </td>
    </tr>
  `;

  fetch(
    `${BACKEND}/api/admin/history?teacher_id=${teacherId}&department=${dept.value}&date=${selectedDate}`
  )
    .then(res => res.json())
    .then(rows => {
      showLoader(false);
      table.innerHTML = "";

      if (!rows || rows.length === 0) {
        table.innerHTML = `
          <tr>
            <td colspan="3" class="p-4 text-center text-gray-500">
              No attendance found for this date
            </td>
          </tr>
        `;
        return;
      }

      rows.forEach(r => {
        table.innerHTML += `
          <tr class="border-b">
            <td class="p-3">${r.name}</td>
            <td class="p-3">${r.roll_no}</td>
            <td class="p-3 font-semibold ${
              r.status === "PRESENT"
                ? "text-green-600"
                : "text-red-600"
            }">
              ${r.status}
            </td>
          </tr>
        `;
      });
    })
    .catch(() => {
      showLoader(false);
      table.innerHTML = `
        <tr>
          <td colspan="3" class="p-4 text-center text-red-500">
            Failed to load attendance
          </td>
        </tr>
      `;
    });
}

// ---------- EXPORT EXCEL ----------
function exportExcel() {
  const selectedDate = date.value;

  if (!selectedDate) {
    alert("Please select a date first");
    return;
  }

  window.open(
    `${BACKEND}/api/admin/export?teacher_id=${teacherId}&department=${dept.value}&date=${selectedDate}`,
    "_blank"
  );
      }
