const API_BASE = "/api";
const DISPLAY_LIMIT_BYTES = 1024 * 1024 * 1024;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;

const state = {
  token: localStorage.getItem("cloudvault_token"),
  user: JSON.parse(localStorage.getItem("cloudvault_user") || "null"),
  files: [],
  selectedFile: null,
  searchTimer: null
};

const elements = {
  authPage: document.getElementById("authPage"),
  dashboardPage: document.getElementById("dashboardPage"),
  loginView: document.getElementById("loginView"),
  registerView: document.getElementById("registerView"),
  loginTab: document.getElementById("loginTab"),
  registerTab: document.getElementById("registerTab"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  loginButton: document.getElementById("loginButton"),
  registerButton: document.getElementById("registerButton"),
  logoutButton: document.getElementById("logoutButton"),
  sidebar: document.getElementById("sidebar"),
  openSidebar: document.getElementById("openSidebar"),
  closeSidebar: document.getElementById("closeSidebar"),
  uploadNavButton: document.getElementById("uploadNavButton"),
  topUploadButton: document.getElementById("topUploadButton"),
  browseButton: document.getElementById("browseButton"),
  fileInput: document.getElementById("fileInput"),
  dropZone: document.getElementById("dropZone"),
  uploadModal: document.getElementById("uploadModal"),
  closeModal: document.getElementById("closeModal"),
  cancelUpload: document.getElementById("cancelUpload"),
  confirmUpload: document.getElementById("confirmUpload"),
  selectedFileText: document.getElementById("selectedFileText"),
  uploadProgressWrap: document.getElementById("uploadProgressWrap"),
  uploadProgress: document.getElementById("uploadProgress"),
  uploadStatusText: document.getElementById("uploadStatusText"),
  searchInput: document.getElementById("searchInput"),
  refreshButton: document.getElementById("refreshButton"),
  fileTableBody: document.getElementById("fileTableBody"),
  emptyState: document.getElementById("emptyState"),
  loadingState: document.getElementById("loadingState"),
  totalFiles: document.getElementById("totalFiles"),
  totalStorage: document.getElementById("totalStorage"),
  storageText: document.getElementById("storageText"),
  storageProgress: document.getElementById("storageProgress"),
  fileSummary: document.getElementById("fileSummary"),
  welcomeName: document.getElementById("welcomeName"),
  sidebarName: document.getElementById("sidebarName"),
  sidebarEmail: document.getElementById("sidebarEmail"),
  userAvatar: document.getElementById("userAvatar"),
  currentDate: document.getElementById("currentDate"),
  toast: document.getElementById("toast"),

  // FORGOT PASSWORD
  forgotPasswordLink: document.getElementById("forgotPasswordLink"),
  forgotPasswordModal: document.getElementById("forgotPasswordModal"),
  closeForgotPasswordModal: document.getElementById("closeForgotPasswordModal"),
  forgotPasswordStep1Form: document.getElementById("forgotPasswordStep1Form"),
  forgotPasswordEmail: document.getElementById("forgotPasswordEmail"),
  sendResetCodeBtn: document.getElementById("sendResetCodeBtn"),
  forgotPasswordStep2Form: document.getElementById("forgotPasswordStep2Form"),
  demoCodeDisplay: document.getElementById("demoCodeDisplay"),
  resetCodeInput: document.getElementById("resetCodeInput"),
  resetNewPassword: document.getElementById("resetNewPassword"),
  confirmResetPasswordBtn: document.getElementById("confirmResetPasswordBtn"),

  // TOP-LEFT MENU DROPDOWN
  topLeftMenuDropdown: document.getElementById("topLeftMenuDropdown"),
  menuMembershipBtn: document.getElementById("menuMembershipBtn"),
  menuSettingsBtn: document.getElementById("menuSettingsBtn"),
  menuHelpBtn: document.getElementById("menuHelpBtn"),

  // MEMBERSHIP
  membershipModal: document.getElementById("membershipModal"),
  closeMembershipModal: document.getElementById("closeMembershipModal"),
  modalCurrentPlanName: document.getElementById("modalCurrentPlanName"),
  modalCurrentStorageText: document.getElementById("modalCurrentStorageText"),
  modalPlanBadge: document.getElementById("modalPlanBadge"),

  // SETTINGS
  settingsModal: document.getElementById("settingsModal"),
  closeSettingsModal: document.getElementById("closeSettingsModal"),
  profileForm: document.getElementById("profileForm"),
  settingsName: document.getElementById("settingsName"),
  settingsEmail: document.getElementById("settingsEmail"),
  changePasswordForm: document.getElementById("changePasswordForm"),
  settingsCurrentPassword: document.getElementById("settingsCurrentPassword"),
  settingsNewPassword: document.getElementById("settingsNewPassword"),
  themeLightBtn: document.getElementById("themeLightBtn"),
  themeDarkBtn: document.getElementById("themeDarkBtn"),
  emailNotifToggle: document.getElementById("emailNotifToggle"),
  autoCleanupToggle: document.getElementById("autoCleanupToggle"),

  // HELP
  helpModal: document.getElementById("helpModal"),
  closeHelpModal: document.getElementById("closeHelpModal"),
  faqSearchInput: document.getElementById("faqSearchInput"),
  supportTicketForm: document.getElementById("supportTicketForm"),
  ticketSubject: document.getElementById("ticketSubject"),
  ticketPriority: document.getElementById("ticketPriority"),
  ticketMessage: document.getElementById("ticketMessage")
};

function showToast(message, type = "success") {
  elements.toast.textContent = message;
  elements.toast.className = `toast show ${type === "error" ? "error" : ""}`;

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.className = "toast";
  }, 3200);
}

async function apiRequest(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };

  if (state.token) {
    headers.Authorization = `Bearer ${state.token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok) {
    if (response.status === 401 && state.token) {
      clearSession();
      showAuth();
    }
    throw new Error(data?.message || "Something went wrong");
  }

  return data;
}

function setButtonLoading(button, loading, loadingText) {
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

function saveSession(data) {
  state.token = data.token;
  state.user = data.user;
  localStorage.setItem("cloudvault_token", data.token);
  localStorage.setItem("cloudvault_user", JSON.stringify(data.user));
}

function clearSession() {
  state.token = null;
  state.user = null;
  state.files = [];
  localStorage.removeItem("cloudvault_token");
  localStorage.removeItem("cloudvault_user");
}

function showAuth() {
  elements.dashboardPage.classList.add("hidden");
  elements.authPage.classList.remove("hidden");
}

function showDashboard() {
  elements.authPage.classList.add("hidden");
  elements.dashboardPage.classList.remove("hidden");
  updateUserInterface();
  loadFiles();
}

function switchAuthView(view) {
  const isLogin = view === "login";
  elements.loginView.classList.toggle("hidden", !isLogin);
  elements.registerView.classList.toggle("hidden", isLogin);
  elements.loginTab.classList.toggle("active", isLogin);
  elements.registerTab.classList.toggle("active", !isLogin);
}

function updateUserInterface() {
  const user = state.user || {};
  const firstName = (user.name || "User").split(" ")[0];

  elements.welcomeName.textContent = firstName;
  elements.sidebarName.textContent = user.name || "User";
  elements.sidebarEmail.textContent = user.email || "";
  elements.userAvatar.textContent = (user.name || "U").charAt(0).toUpperCase();

  // Theme application
  const theme = user.settings?.theme || localStorage.getItem("cloudvault_theme") || "light";
  if (theme === "dark") {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
  }

  // Update Settings form defaults
  if (elements.settingsName) elements.settingsName.value = user.name || "";
  if (elements.settingsEmail) elements.settingsEmail.value = user.email || "";
  if (elements.emailNotifToggle) elements.emailNotifToggle.checked = user.settings?.emailNotifications !== false;
  if (elements.autoCleanupToggle) elements.autoCleanupToggle.checked = !!user.settings?.autoCleanup;

  elements.currentDate.textContent = new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date());
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  const value = bytes / 1024 ** index;

  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function getFileExtension(name) {
  const parts = String(name).split(".");
  return parts.length > 1 ? parts.pop().toUpperCase().slice(0, 4) : "FILE";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function updateStats(totalSize = 0) {
  const userLimit = state.user?.membership?.storageLimitBytes || DISPLAY_LIMIT_BYTES;

  elements.totalFiles.textContent = state.files.length;
  elements.totalStorage.textContent = formatBytes(totalSize);
  elements.storageText.textContent = `${formatBytes(totalSize)} / ${formatBytes(userLimit)}`;
  elements.storageProgress.style.width =
    `${Math.min((totalSize / userLimit) * 100, 100)}%`;

  elements.fileSummary.textContent = state.files.length
    ? `${state.files.length} file${state.files.length === 1 ? "" : "s"} in your cloud storage`
    : "Your uploaded files will appear here.";
}

function renderFiles() {
  elements.fileTableBody.innerHTML = "";

  if (!state.files.length) {
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");

  state.files.forEach((file) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <div class="file-name-cell">
          <div class="file-type-icon">${escapeHtml(getFileExtension(file.originalName))}</div>
          <span title="${escapeHtml(file.originalName)}">${escapeHtml(file.originalName)}</span>
        </div>
      </td>
      <td>${escapeHtml(file.mimeType || "Unknown")}</td>
      <td>${formatBytes(file.size)}</td>
      <td>${new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date(file.createdAt))}</td>
      <td>
        <div class="action-group">
          <button class="table-action" data-action="download" data-id="${file._id}">Download</button>
          <button class="table-action" data-action="rename" data-id="${file._id}">Rename</button>
          <button class="table-action danger" data-action="delete" data-id="${file._id}">Delete</button>
        </div>
      </td>
    `;
    elements.fileTableBody.appendChild(row);
  });
}

async function loadFiles(search = "") {
  elements.loadingState.classList.remove("hidden");
  elements.emptyState.classList.add("hidden");
  elements.fileTableBody.innerHTML = "";

  try {
    const data = await apiRequest(
      `/files${search ? `?search=${encodeURIComponent(search)}` : ""}`
    );

    state.files = data.files;
    renderFiles();
    updateStats(data.totalSize);
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    elements.loadingState.classList.add("hidden");
  }
}

function openFilePicker() {
  elements.fileInput.value = "";
  elements.fileInput.click();
}

function selectFile(file) {
  if (!file) return;

  if (file.size > MAX_FILE_SIZE_BYTES) {
    showToast("File must be 25 MB or smaller", "error");
    return;
  }

  state.selectedFile = file;
  elements.selectedFileText.textContent =
    `${file.name} • ${formatBytes(file.size)}`;
  elements.confirmUpload.disabled = false;
  elements.uploadProgressWrap.classList.add("hidden");
  elements.uploadProgress.style.width = "0%";
  elements.uploadModal.classList.remove("hidden");
}

function closeUploadModal() {
  if (elements.confirmUpload.disabled &&
      !elements.uploadProgressWrap.classList.contains("hidden")) {
    return;
  }

  state.selectedFile = null;
  elements.selectedFileText.textContent = "Choose a file from your computer.";
  elements.confirmUpload.disabled = true;
  elements.uploadModal.classList.add("hidden");
}

function uploadSelectedFile() {
  if (!state.selectedFile) return;

  const formData = new FormData();
  formData.append("file", state.selectedFile);

  elements.confirmUpload.disabled = true;
  elements.cancelUpload.disabled = true;
  elements.closeModal.disabled = true;
  elements.uploadProgressWrap.classList.remove("hidden");
  elements.uploadProgress.style.width = "10%";
  elements.uploadStatusText.textContent = "Uploading to MongoDB Atlas...";

  const xhr = new XMLHttpRequest();
  xhr.open("POST", `${API_BASE}/files/upload`);
  xhr.setRequestHeader("Authorization", `Bearer ${state.token}`);

  xhr.upload.addEventListener("progress", (event) => {
    if (!event.lengthComputable) return;
    const progress = Math.max(10, Math.round((event.loaded / event.total) * 95));
    elements.uploadProgress.style.width = `${progress}%`;
  });

  xhr.addEventListener("load", async () => {
    let response = {};
    try {
      response = JSON.parse(xhr.responseText || "{}");
    } catch {}

    elements.cancelUpload.disabled = false;
    elements.closeModal.disabled = false;

    if (xhr.status >= 200 && xhr.status < 300) {
      elements.uploadProgress.style.width = "100%";
      elements.uploadStatusText.textContent = "Upload complete";
      showToast(response.message || "File uploaded successfully");

      setTimeout(() => {
        closeUploadModal();
        loadFiles(elements.searchInput.value.trim());
      }, 500);
    } else {
      elements.confirmUpload.disabled = false;
      elements.uploadStatusText.textContent = "Upload failed";
      showToast(response.message || "Could not upload file", "error");
    }
  });

  xhr.addEventListener("error", () => {
    elements.confirmUpload.disabled = false;
    elements.cancelUpload.disabled = false;
    elements.closeModal.disabled = false;
    elements.uploadStatusText.textContent = "Upload failed";
    showToast("Network error during upload", "error");
  });

  xhr.send(formData);
}

async function downloadFile(fileId) {
  try {
    const file = state.files.find((item) => item._id === fileId);
    const response = await fetch(`${API_BASE}/files/${fileId}/download`, {
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Download failed");
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = file?.originalName || "download";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function renameFile(fileId) {
  const file = state.files.find((item) => item._id === fileId);
  const newName = window.prompt("Enter a new file name:", file?.originalName || "");

  if (!newName || newName.trim() === file?.originalName) return;

  try {
    await apiRequest(`/files/${fileId}`, {
      method: "PATCH",
      body: JSON.stringify({ name: newName.trim() })
    });
    showToast("File renamed successfully");
    loadFiles(elements.searchInput.value.trim());
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function deleteFile(fileId) {
  const file = state.files.find((item) => item._id === fileId);
  const confirmed = window.confirm(
    `Delete "${file?.originalName || "this file"}"? This cannot be undone.`
  );

  if (!confirmed) return;

  try {
    await apiRequest(`/files/${fileId}`, { method: "DELETE" });
    showToast("File deleted successfully");
    loadFiles(elements.searchInput.value.trim());
  } catch (error) {
    showToast(error.message, "error");
  }
}

elements.loginTab.addEventListener("click", () => switchAuthView("login"));
elements.registerTab.addEventListener("click", () => switchAuthView("register"));

document.querySelectorAll(".password-toggle").forEach((button) => {
  button.addEventListener("click", () => {
    const input = document.getElementById(button.dataset.target);
    const showing = input.type === "text";
    input.type = showing ? "password" : "text";
    button.textContent = showing ? "Show" : "Hide";
  });
});

elements.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setButtonLoading(elements.loginButton, true, "Signing in...");

  try {
    const data = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: document.getElementById("loginEmail").value,
        password: document.getElementById("loginPassword").value
      })
    });

    saveSession(data);
    elements.loginForm.reset();
    showDashboard();
    showToast("Welcome back");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(elements.loginButton, false);
  }
});

elements.registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setButtonLoading(elements.registerButton, true, "Creating account...");

  try {
    const data = await apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: document.getElementById("registerName").value,
        email: document.getElementById("registerEmail").value,
        password: document.getElementById("registerPassword").value
      })
    });

    saveSession(data);
    elements.registerForm.reset();
    showDashboard();
    showToast("Account created successfully");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(elements.registerButton, false);
  }
});

elements.logoutButton.addEventListener("click", () => {
  clearSession();
  showAuth();
  switchAuthView("login");
  showToast("You have been logged out");
});

[
  elements.uploadNavButton,
  elements.topUploadButton,
  elements.browseButton
].forEach((button) => button.addEventListener("click", (event) => {
  event.stopPropagation();
  openFilePicker();
}));

elements.dropZone.addEventListener("click", openFilePicker);
elements.dropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") openFilePicker();
});

elements.fileInput.addEventListener("change", () => {
  selectFile(elements.fileInput.files[0]);
});

["dragenter", "dragover"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  elements.dropZone.addEventListener(eventName, (event) => {
    event.preventDefault();
    elements.dropZone.classList.remove("dragging");
  });
});

elements.dropZone.addEventListener("drop", (event) => {
  selectFile(event.dataTransfer.files[0]);
});

elements.confirmUpload.addEventListener("click", uploadSelectedFile);
elements.cancelUpload.addEventListener("click", closeUploadModal);
elements.closeModal.addEventListener("click", closeUploadModal);

elements.uploadModal.addEventListener("click", (event) => {
  if (event.target === elements.uploadModal) closeUploadModal();
});

elements.refreshButton.addEventListener("click", () => {
  loadFiles(elements.searchInput.value.trim());
});

elements.searchInput.addEventListener("input", () => {
  clearTimeout(state.searchTimer);
  state.searchTimer = setTimeout(() => {
    loadFiles(elements.searchInput.value.trim());
  }, 350);
});

elements.fileTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const { action, id } = button.dataset;

  if (action === "download") downloadFile(id);
  if (action === "rename") renameFile(id);
  if (action === "delete") deleteFile(id);
});

/* --- FORGOT PASSWORD MODAL FUNCTIONS --- */
function openForgotPasswordModal() {
  elements.forgotPasswordModal.classList.remove("hidden");
  elements.forgotPasswordStep1Form.classList.remove("hidden");
  elements.forgotPasswordStep2Form.classList.add("hidden");
  const loginEmail = document.getElementById("loginEmail");
  if (loginEmail && elements.forgotPasswordEmail) {
    elements.forgotPasswordEmail.value = loginEmail.value;
  }
}

function closeForgotPasswordModal() {
  elements.forgotPasswordModal.classList.add("hidden");
}

async function handleSendResetCode(event) {
  event.preventDefault();
  const email = elements.forgotPasswordEmail.value.trim();
  if (!email) return;

  setButtonLoading(elements.sendResetCodeBtn, true, "Sending code...");

  try {
    const data = await apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });

    showToast(data.message || "Reset code sent!");
    elements.demoCodeDisplay.textContent = data.resetCode || data.demoCode || "123456";
    elements.forgotPasswordStep1Form.classList.add("hidden");
    elements.forgotPasswordStep2Form.classList.remove("hidden");
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(elements.sendResetCodeBtn, false);
  }
}

async function handleConfirmResetPassword(event) {
  event.preventDefault();
  const email = elements.forgotPasswordEmail.value.trim();
  const code = elements.resetCodeInput.value.trim();
  const newPassword = elements.resetNewPassword.value;

  if (!email || !code || !newPassword) return;

  setButtonLoading(elements.confirmResetPasswordBtn, true, "Updating password...");

  try {
    const data = await apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword })
    });

    showToast(data.message || "Password reset successful! Please sign in.");
    closeForgotPasswordModal();
    const loginEmail = document.getElementById("loginEmail");
    const loginPassword = document.getElementById("loginPassword");
    if (loginEmail) loginEmail.value = email;
    if (loginPassword) loginPassword.value = newPassword;
  } catch (error) {
    showToast(error.message, "error");
  } finally {
    setButtonLoading(elements.confirmResetPasswordBtn, false);
  }
}

/* --- TOP-LEFT THREE DASHES DROPDOWN MENU --- */
function toggleTopLeftMenu(event) {
  event.stopPropagation();
  elements.topLeftMenuDropdown.classList.toggle("hidden");
}

function closeTopLeftMenu() {
  if (elements.topLeftMenuDropdown) {
    elements.topLeftMenuDropdown.classList.add("hidden");
  }
}

/* --- MEMBERSHIP MODAL FUNCTIONS --- */
function openMembershipModal() {
  closeTopLeftMenu();
  updateMembershipModalUI();
  elements.membershipModal.classList.remove("hidden");
}

function closeMembershipModal() {
  elements.membershipModal.classList.add("hidden");
}

function updateMembershipModalUI() {
  const currentPlan = state.user?.membership?.plan || "free";
  const limitBytes = state.user?.membership?.storageLimitBytes || DISPLAY_LIMIT_BYTES;

  elements.modalCurrentPlanName.textContent = currentPlan.toUpperCase() + " Plan";
  elements.modalCurrentStorageText.textContent = `${formatBytes(limitBytes)} total cloud storage limit`;
  elements.modalPlanBadge.textContent = state.user?.membership?.status || "Active";

  document.querySelectorAll(".plan-card").forEach((card) => {
    const plan = card.dataset.plan;
    const btn = card.querySelector(".select-plan-btn");
    if (plan === currentPlan) {
      card.classList.add("featured");
      if (btn) {
        btn.textContent = "Current Plan";
        btn.disabled = true;
      }
    } else {
      card.classList.remove("featured");
      if (btn) {
        btn.textContent = plan === "free" ? "Downgrade" : `Upgrade to ${plan.toUpperCase()}`;
        btn.disabled = false;
      }
    }
  });
}

async function handleSelectPlan(plan) {
  try {
    const data = await apiRequest("/user/membership", {
      method: "POST",
      body: JSON.stringify({ plan })
    });

    if (!state.user.membership) state.user.membership = {};
    state.user.membership = data.membership;
    localStorage.setItem("cloudvault_user", JSON.stringify(state.user));
    showToast(data.message || `Upgraded to ${plan.toUpperCase()} plan!`);
    updateMembershipModalUI();
    updateUserInterface();
    loadFiles();
  } catch (error) {
    showToast(error.message, "error");
  }
}

/* --- SETTINGS MODAL FUNCTIONS --- */
function openSettingsModal() {
  closeTopLeftMenu();
  updateUserInterface();
  elements.settingsModal.classList.remove("hidden");
}

function closeSettingsModal() {
  elements.settingsModal.classList.add("hidden");
}

function switchSettingsTab(tabId) {
  document.querySelectorAll(".settings-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabId);
  });
  document.querySelectorAll(".settings-tab-content").forEach((content) => {
    content.classList.toggle("hidden", content.id !== tabId);
  });
}

async function handleSaveProfile(event) {
  event.preventDefault();
  const name = elements.settingsName.value.trim();
  const email = elements.settingsEmail.value.trim();

  try {
    const data = await apiRequest("/user/profile", {
      method: "PUT",
      body: JSON.stringify({ name, email })
    });

    state.user = { ...state.user, ...data.user };
    localStorage.setItem("cloudvault_user", JSON.stringify(state.user));
    showToast("Profile updated successfully!");
    updateUserInterface();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleChangePassword(event) {
  event.preventDefault();
  const currentPassword = elements.settingsCurrentPassword.value;
  const newPassword = elements.settingsNewPassword.value;

  try {
    const data = await apiRequest("/user/password", {
      method: "PUT",
      body: JSON.stringify({ currentPassword, newPassword })
    });

    showToast(data.message || "Password changed successfully!");
    elements.changePasswordForm.reset();
  } catch (error) {
    showToast(error.message, "error");
  }
}

async function handleUpdateTheme(theme) {
  document.body.classList.toggle("dark-theme", theme === "dark");
  if (elements.themeLightBtn) elements.themeLightBtn.classList.toggle("active", theme === "light");
  if (elements.themeDarkBtn) elements.themeDarkBtn.classList.toggle("active", theme === "dark");

  localStorage.setItem("cloudvault_theme", theme);
  if (state.user) {
    if (!state.user.settings) state.user.settings = {};
    state.user.settings.theme = theme;
    localStorage.setItem("cloudvault_user", JSON.stringify(state.user));
  }

  try {
    await apiRequest("/user/settings", {
      method: "PUT",
      body: JSON.stringify({ theme })
    });
  } catch (e) {
    console.log("Theme setting saved locally");
  }
}

/* --- HELP MODAL FUNCTIONS --- */
function openHelpModal() {
  closeTopLeftMenu();
  elements.helpModal.classList.remove("hidden");
}

function closeHelpModal() {
  elements.helpModal.classList.add("hidden");
}

function handleFaqSearch() {
  const query = elements.faqSearchInput.value.toLowerCase().trim();
  document.querySelectorAll(".faq-item").forEach((item) => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? "block" : "none";
  });
}

async function handleSupportTicket(event) {
  event.preventDefault();
  const subject = elements.ticketSubject.value.trim();
  const priority = elements.ticketPriority.value;
  const message = elements.ticketMessage.value.trim();

  try {
    const data = await apiRequest("/support/ticket", {
      method: "POST",
      body: JSON.stringify({ subject, priority, message })
    });

    showToast(`Support Ticket #${data.ticket.id} submitted! We'll respond shortly.`);
    elements.supportTicketForm.reset();
  } catch (error) {
    showToast(error.message, "error");
  }
}

// EVENT LISTENERS REGISTRATION
if (elements.forgotPasswordLink) {
  elements.forgotPasswordLink.addEventListener("click", openForgotPasswordModal);
}
if (elements.closeForgotPasswordModal) {
  elements.closeForgotPasswordModal.addEventListener("click", closeForgotPasswordModal);
}
if (elements.forgotPasswordStep1Form) {
  elements.forgotPasswordStep1Form.addEventListener("submit", handleSendResetCode);
}
if (elements.forgotPasswordStep2Form) {
  elements.forgotPasswordStep2Form.addEventListener("submit", handleConfirmResetPassword);
}

// Top-left 3 dashes menu button click
elements.openSidebar.addEventListener("click", (event) => {
  if (window.innerWidth > 900) {
    toggleTopLeftMenu(event);
  } else {
    elements.sidebar.classList.add("open");
  }
});

document.addEventListener("click", (event) => {
  if (!elements.topLeftMenuDropdown.contains(event.target) && event.target !== elements.openSidebar) {
    closeTopLeftMenu();
  }
});

if (elements.menuMembershipBtn) elements.menuMembershipBtn.addEventListener("click", openMembershipModal);
if (elements.menuSettingsBtn) elements.menuSettingsBtn.addEventListener("click", openSettingsModal);
if (elements.menuHelpBtn) elements.menuHelpBtn.addEventListener("click", openHelpModal);

if (elements.closeMembershipModal) elements.closeMembershipModal.addEventListener("click", closeMembershipModal);
if (elements.closeSettingsModal) elements.closeSettingsModal.addEventListener("click", closeSettingsModal);
if (elements.closeHelpModal) elements.closeHelpModal.addEventListener("click", closeHelpModal);

document.querySelectorAll(".select-plan-btn").forEach((btn) => {
  btn.addEventListener("click", () => handleSelectPlan(btn.dataset.plan));
});

document.querySelectorAll(".settings-tab").forEach((tab) => {
  tab.addEventListener("click", () => switchSettingsTab(tab.dataset.tab));
});

if (elements.profileForm) elements.profileForm.addEventListener("click", (e) => e.stopPropagation());
if (elements.profileForm) elements.profileForm.addEventListener("submit", handleSaveProfile);
if (elements.changePasswordForm) elements.changePasswordForm.addEventListener("submit", handleChangePassword);

if (elements.themeLightBtn) elements.themeLightBtn.addEventListener("click", () => handleUpdateTheme("light"));
if (elements.themeDarkBtn) elements.themeDarkBtn.addEventListener("click", () => handleUpdateTheme("dark"));

if (elements.faqSearchInput) elements.faqSearchInput.addEventListener("input", handleFaqSearch);
if (elements.supportTicketForm) elements.supportTicketForm.addEventListener("submit", handleSupportTicket);

elements.closeSidebar.addEventListener("click", () => {
  elements.sidebar.classList.remove("open");
});

async function initialize() {
  if (!state.token || !state.user) {
    showAuth();
    return;
  }

  try {
    const data = await apiRequest("/auth/profile");
    state.user = data.user;
    localStorage.setItem("cloudvault_user", JSON.stringify(data.user));
    showDashboard();
  } catch {
    clearSession();
    showAuth();
  }
}

initialize();
