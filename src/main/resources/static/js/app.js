(function () {
    "use strict";

    var TOKEN_KEY = "sem.jwt";
    var USER_KEY = "sem.user";
    var THEME_KEY = "sem.theme";
    var EXPENSE_PAGE_SIZE = 10;
    var page = document.body.dataset.page;

    // Set theme immediately to avoid visual flash
    (function () {
        var savedTheme = localStorage.getItem(THEME_KEY);
        if (!savedTheme) {
            if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
                savedTheme = "dark";
            } else {
                savedTheme = "light";
            }
        }
        document.documentElement.setAttribute("data-theme", savedTheme);
    })();

    var state = {
        profile: null,
        summary: null,
        categories: [],
        expenses: [],
        incomes: [],
        budgets: [],
        budgetChecks: [],
        report: null,
        expensePage: 1,
        budgetHighlight: "",
        activeView: "dashboard"
    };

    var charts = {
        monthlyTrend: null,
        reportMonthly: null
    };

    var viewMeta = {
        dashboard: ["Overview", "Dashboard"],
        expenses: ["Spending", "Expenses"],
        income: ["Cash flow", "Income"],
        budgets: ["Limits", "Budgets"],
        insights: ["Smart rules", "Smart Insights"],
        categories: ["Organization", "Categories"],
        reports: ["Monthly view", "Reports"],
        profile: ["Account", "Profile"]
    };

    document.addEventListener("DOMContentLoaded", function () {
        initThemeToggle();
        if (page === "login") {
            initLogin();
            return;
        }
        if (page === "register") {
            initRegister();
            return;
        }
        if (page === "forgot-password") {
            initForgotPassword();
            return;
        }
        if (page === "reset-password") {
            initResetPassword();
            return;
        }
        if (page === "app") {
            initApp();
        }
    });

    function initThemeToggle() {
        var toggleBtn = get("themeToggleButton");
        if (!toggleBtn) {
            return;
        }
        toggleBtn.addEventListener("click", function () {
            var currentTheme = document.documentElement.getAttribute("data-theme") || "light";
            var newTheme = currentTheme === "dark" ? "light" : "dark";
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            renderAllCharts();
        });
    }

    function $(selector) {
        return document.querySelector(selector);
    }

    function $all(selector) {
        return Array.prototype.slice.call(document.querySelectorAll(selector));
    }

    function get(id) {
        return document.getElementById(id);
    }

    var REFRESH_TOKEN_KEY = "sem.refreshToken";

    function generateUUID() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY);
    }

    function getRefreshToken() {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }

    function setSession(authData) {
        if (!authData) return;
        sessionStorage.setItem(TOKEN_KEY, authData.token || authData.accessToken);
        if (authData.refreshToken) {
            sessionStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
        }
        if (authData.user) {
            sessionStorage.setItem(USER_KEY, JSON.stringify({
                id: authData.user.id,
                name: authData.user.name,
                email: authData.user.email
            }));
        } else if (authData.userId) {
            sessionStorage.setItem(USER_KEY, JSON.stringify({
                id: authData.userId,
                name: authData.name,
                email: authData.email
            }));
        }
    }

    function clearSession() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(REFRESH_TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    }

    async function tryRefreshToken() {
        var refreshTok = getRefreshToken();
        if (!refreshTok) return false;
        try {
            var response = await fetch("/api/v1/auth/refresh", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ refreshToken: refreshTok })
            });
            if (!response.ok) return false;
            var payload = await response.json();
            if (payload && (payload.data || payload.accessToken)) {
                var newToken = payload.data ? payload.data.accessToken : payload.accessToken;
                var newRefresh = payload.data ? payload.data.refreshToken : payload.refreshToken;
                sessionStorage.setItem(TOKEN_KEY, newToken);
                if (newRefresh) sessionStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
                return true;
            }
        } catch (e) {
            console.error("Token refresh failed:", e);
        }
        return false;
    }

    async function api(path, options, isRetry) {
        var request = options || {};
        var headers = Object.assign({}, request.headers || {});
        var method = (request.method || "GET").toUpperCase();

        if (request.body && !headers["Content-Type"]) {
            headers["Content-Type"] = "application/json";
        }

        if ((method === "POST" || method === "PUT") && !headers["Idempotency-Key"]) {
            headers["Idempotency-Key"] = generateUUID();
        }

        var token = getToken();
        if (token) {
            headers.Authorization = "Bearer " + token;
        }

        var response = await fetch(path, Object.assign({}, request, { headers: headers }));
        var payload = null;
        var text = await response.text();

        if (text) {
            try {
                payload = JSON.parse(text);
            } catch (error) {
                payload = { message: text };
            }
        }

        if ((response.status === 401 || response.status === 403) && getToken()) {
            if (!isRetry) {
                var refreshed = await tryRefreshToken();
                if (refreshed) {
                    return await api(path, options, true);
                }
            }
            clearSession();
            window.location.href = "/login";
            throw new Error("Your session expired. Please sign in again.");
        }

        if (!response.ok) {
            throw new Error(apiMessage(payload) || "Request failed");
        }

        return payload ? (payload.data !== undefined ? payload.data : payload) : null;
    }

    function apiMessage(payload) {
        if (!payload) {
            return "";
        }
        if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
            var fieldMessages = Object.keys(payload.data).map(function (key) {
                return payload.data[key];
            });
            if (fieldMessages.length) {
                return fieldMessages.join(" ");
            }
        }
        return payload.message || "";
    }

    function initLogin() {
        if (getToken()) {
            window.location.href = "/app";
            return;
        }

        get("loginForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            setButtonBusy(event.submitter, true);
            showAlert("loginAlert", "");
            try {
                var data = await api("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({
                        email: get("loginEmail").value.trim(),
                        password: get("loginPassword").value
                    })
                });
                setSession(data);
                window.location.href = "/app";
            } catch (error) {
                showAlert("loginAlert", error.message || "Could not sign in.");
            } finally {
                setButtonBusy(event.submitter, false);
            }
        });
    }

    function initRegister() {
        if (getToken()) {
            window.location.href = "/app";
            return;
        }

        get("registerForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            setButtonBusy(event.submitter, true);
            showAlert("registerAlert", "");
            try {
                var data = await api("/api/auth/register", {
                    method: "POST",
                    body: JSON.stringify({
                        name: get("registerName").value.trim(),
                        email: get("registerEmail").value.trim(),
                        password: get("registerPassword").value
                    })
                });
                setSession(data);
                window.location.href = "/app";
            } catch (error) {
                showAlert("registerAlert", error.message || "Could not create account.");
            } finally {
                setButtonBusy(event.submitter, false);
            }
        });
    }

    function initForgotPassword() {
        if (getToken()) {
            window.location.href = "/app";
            return;
        }

        get("forgotPasswordForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            setButtonBusy(event.submitter, true);
            showAlert("forgotPasswordAlert", "");
            setResetResult("");
            try {
                var data = await api("/api/auth/forgot-password", {
                    method: "POST",
                    body: JSON.stringify({
                        email: get("forgotPasswordEmail").value.trim()
                    })
                });
                showAlert("forgotPasswordAlert", "If an account exists, a reset link has been prepared.", true);
                if (data && data.resetLinkAvailable && data.resetUrl) {
                    setResetResult(data.resetUrl, data.expiresAt);
                }
            } catch (error) {
                showAlert("forgotPasswordAlert", error.message || "Could not generate reset link.");
            } finally {
                setButtonBusy(event.submitter, false);
            }
        });
    }

    function initResetPassword() {
        clearSession();
        var token = new URLSearchParams(window.location.search).get("token") || "";
        get("resetPasswordToken").value = token;
        if (!token) {
            showAlert("resetPasswordAlert", "This reset link is missing a token. Request a new password reset link.");
        }

        get("resetPasswordForm").addEventListener("submit", async function (event) {
            event.preventDefault();
            setButtonBusy(event.submitter, true);
            showAlert("resetPasswordAlert", "");
            try {
                var password = get("newPassword").value;
                var confirmPassword = get("confirmNewPassword").value;
                if (password !== confirmPassword) {
                    throw new Error("Passwords do not match.");
                }
                await api("/api/auth/reset-password", {
                    method: "POST",
                    body: JSON.stringify({
                        token: get("resetPasswordToken").value,
                        password: password,
                        confirmPassword: confirmPassword
                    })
                });
                showAlert("resetPasswordAlert", "Password reset successfully. You can sign in now.", true);
                get("resetPasswordForm").reset();
                window.setTimeout(function () {
                    window.location.href = "/login";
                }, 1800);
            } catch (error) {
                showAlert("resetPasswordAlert", error.message || "Could not reset password.");
            } finally {
                setButtonBusy(event.submitter, false);
            }
        });
    }

    function initApp() {
        if (!getToken()) {
            window.location.href = "/login";
            return;
        }

        initNavigation();
        initDates();
        initForms();
        applyRouteDefaults(readRouteParams());
        loadAll();
    }

    function initNavigation() {
        $all(".nav-item").forEach(function (button) {
            button.addEventListener("click", function () {
                navigateToView(button.dataset.view);
            });
        });

        $all("[data-jump]").forEach(function (button) {
            button.addEventListener("click", function () {
                navigateToView(button.dataset.jump);
            });
        });

        window.addEventListener("popstate", function () {
            var params = readRouteParams();
            applyRouteDefaults(params);
            applyRouteIntent(params, true);
        });

        get("logoutButton").addEventListener("click", function () {
            clearSession();
            window.location.href = "/login";
        });

        get("mobileMenuButton").addEventListener("click", function () {
            $(".sidebar").classList.toggle("open");
        });
    }

    function switchView(view) {
        state.activeView = view;
        $all(".view").forEach(function (section) {
            section.classList.toggle("active", section.id === "view-" + view);
        });
        $all(".nav-item").forEach(function (button) {
            button.classList.toggle("active", button.dataset.view === view);
        });

        var meta = viewMeta[view] || viewMeta.dashboard;
        get("viewEyebrow").textContent = meta[0];
        get("viewTitle").textContent = meta[1];
        $(".sidebar").classList.remove("open");
    }

    function navigateToView(view, params) {
        switchView(view);
        updateAppUrl(view, params || {});
        applyRouteIntent(Object.assign({ view: view }, params || {}), true);
    }

    function updateAppUrl(view, params) {
        var query = new URLSearchParams();
        query.set("view", view);
        Object.keys(params || {}).forEach(function (key) {
            if (params[key]) {
                query.set(key, params[key]);
            }
        });
        window.history.pushState({}, "", "/app?" + query.toString());
    }

    function readRouteParams() {
        var query = new URLSearchParams(window.location.search);
        var params = {};
        query.forEach(function (value, key) {
            params[key] = value;
        });
        return params;
    }

    function applyRouteDefaults(params) {
        var view = viewMeta[params.view] ? params.view : "dashboard";
        switchView(view);

        if (params.month && get("reportMonth")) {
            get("reportMonth").value = params.month;
        }
        if (params.year && get("reportYear")) {
            get("reportYear").value = params.year;
        }

        state.budgetHighlight = params.highlight || params.focus || "";
    }

    function applyRouteIntent(params, shouldScroll) {
        state.budgetHighlight = params.highlight || params.focus || state.budgetHighlight || "";
        if (state.activeView === "budgets") {
            renderBudgets();
            if (shouldScroll && state.budgetHighlight) {
                window.setTimeout(function () {
                    scrollToBudgetStatus(state.budgetHighlight);
                }, 80);
            }
        }
        if (state.activeView === "reports" && params.currentMonth === "true") {
            setReportToCurrentMonth();
            loadReport();
        }
    }

    function initDates() {
        var now = new Date();
        var today = toDateInput(now);

        get("expenseDate").value = today;
        get("incomeDate").value = today;
        get("budgetMonth").value = now.getMonth() + 1;
        get("budgetYear").value = now.getFullYear();
        get("reportYear").value = now.getFullYear();

        var reportMonth = get("reportMonth");
        monthNames().forEach(function (name, index) {
            var option = document.createElement("option");
            option.value = String(index + 1);
            option.textContent = name;
            reportMonth.appendChild(option);
        });
        reportMonth.value = String(now.getMonth() + 1);
    }

    function initForms() {
        initAmountInputs();
        get("expenseForm").addEventListener("submit", handleExpenseSubmit);
        get("incomeForm").addEventListener("submit", handleIncomeSubmit);
        get("budgetForm").addEventListener("submit", handleBudgetSubmit);
        get("categoryForm").addEventListener("submit", handleCategorySubmit);
        get("profileForm").addEventListener("submit", handleProfileSubmit);
        get("goalAmount").addEventListener("input", renderGoalSimulator);
        get("goalContribution").addEventListener("input", renderGoalSimulator);

        get("resetExpenseForm").addEventListener("click", resetExpenseForm);
        get("resetIncomeForm").addEventListener("click", resetIncomeForm);
        get("resetBudgetForm").addEventListener("click", resetBudgetForm);
        get("resetCategoryForm").addEventListener("click", resetCategoryForm);

        ["expenseFilterCategory", "expenseFilterStart", "expenseFilterEnd"].forEach(function (id) {
            get(id).addEventListener("input", function () {
                state.expensePage = 1;
                renderExpenses();
            });
        });

        get("clearExpenseFilters").addEventListener("click", function () {
            get("expenseFilterCategory").value = "";
            get("expenseFilterStart").value = "";
            get("expenseFilterEnd").value = "";
            state.expensePage = 1;
            renderExpenses();
        });

        get("expensePrevPage").addEventListener("click", function () {
            if (state.expensePage > 1) {
                state.expensePage -= 1;
                renderExpenses();
            }
        });

        get("expenseNextPage").addEventListener("click", function () {
            state.expensePage += 1;
            renderExpenses();
        });

        get("loadReportButton").addEventListener("click", function () {
            updateAppUrl("reports", {
                month: get("reportMonth").value,
                year: get("reportYear").value
            });
            loadReport();
        });
    }

    async function loadAll() {
        showToast("Loading your workspace...");
        try {
            await Promise.all([loadProfile(), loadCategories()]);
            await Promise.all([loadDashboard(), loadExpenses(), loadIncomes(), loadBudgets(), loadBudgetChecks(), loadReport()]);
            applyRouteIntent(readRouteParams(), true);
            renderAllCharts();
            showToast("Workspace ready.");
        } catch (error) {
            showToast(error.message || "Could not load workspace.", true);
        }
    }

    async function loadProfile() {
        state.profile = await api("/api/users/profile");
        renderProfile();
    }

    async function loadDashboard() {
        state.summary = await api("/api/dashboard/summary");
        renderDashboard();
    }

    async function loadCategories() {
        state.categories = await api("/api/categories") || [];
        renderCategories();
        renderCategoryInputs();
    }

    async function loadExpenses() {
        state.expenses = await api("/api/expenses") || [];
        renderExpenses();
        renderAllCharts();
    }

    async function loadIncomes() {
        state.incomes = await api("/api/income") || [];
        renderIncomes();
        renderAllCharts();
    }

    async function loadBudgets() {
        state.budgets = await api("/api/budgets") || [];
        renderBudgets();
    }

    async function loadBudgetChecks() {
        state.budgetChecks = await api("/api/budgets/check") || [];
        renderBudgets();
        renderBudgetSummary();
    }

    async function loadReport() {
        var month = get("reportMonth").value;
        var year = get("reportYear").value;
        var report = await api("/api/dashboard/monthly-report?month=" + encodeURIComponent(month) + "&year=" + encodeURIComponent(year));
        renderReport(report);
    }

    async function handleExpenseSubmit(event) {
        event.preventDefault();
        var id = get("expenseId").value;
        var method = id ? "PUT" : "POST";
        var path = id ? "/api/expenses/" + id : "/api/expenses";
        await submitData(event.submitter, path, method, {
            title: get("expenseTitle").value.trim(),
            amount: rawAmountValue("expenseAmount"),
            category: get("expenseCategory").value.trim(),
            description: get("expenseDescription").value.trim(),
            expenseDate: get("expenseDate").value
        }, async function () {
            resetExpenseForm();
            await Promise.all([loadExpenses(), loadDashboard(), loadBudgetChecks(), loadReport()]);
            showToast("Expense saved.");
        });
    }

    async function handleIncomeSubmit(event) {
        event.preventDefault();
        var id = get("incomeId").value;
        var method = id ? "PUT" : "POST";
        var path = id ? "/api/income/" + id : "/api/income";
        await submitData(event.submitter, path, method, {
            source: get("incomeSource").value.trim(),
            amount: rawAmountValue("incomeAmount"),
            category: get("incomeCategory").value.trim(),
            incomeDate: get("incomeDate").value
        }, async function () {
            resetIncomeForm();
            await Promise.all([loadIncomes(), loadDashboard(), loadReport()]);
            showToast("Income saved.");
        });
    }

    async function handleBudgetSubmit(event) {
        event.preventDefault();
        var id = get("budgetId").value;
        var method = id ? "PUT" : "POST";
        var path = id ? "/api/budgets/" + id : "/api/budgets";
        await submitData(event.submitter, path, method, {
            category: get("budgetCategory").value.trim(),
            limitAmount: rawAmountValue("budgetLimitAmount"),
            month: Number(get("budgetMonth").value),
            year: Number(get("budgetYear").value)
        }, async function () {
            resetBudgetForm();
            await Promise.all([loadBudgets(), loadBudgetChecks()]);
            showToast("Budget saved.");
        });
    }

    async function handleCategorySubmit(event) {
        event.preventDefault();
        var id = get("categoryId").value;
        var method = id ? "PUT" : "POST";
        var path = id ? "/api/categories/" + id : "/api/categories";
        await submitData(event.submitter, path, method, {
            name: get("categoryName").value.trim(),
            type: get("categoryType").value
        }, async function () {
            resetCategoryForm();
            await loadCategories();
            showToast("Category saved.");
        });
    }

    async function handleProfileSubmit(event) {
        event.preventDefault();
        await submitData(event.submitter, "/api/users/profile", "PUT", {
            name: get("profileName").value.trim(),
            email: get("profileEmail").value.trim()
        }, async function () {
            await loadProfile();
            showToast("Profile updated.");
        });
    }

    async function submitData(button, path, method, payload, onSuccess) {
        setButtonBusy(button, true);
        try {
            await api(path, {
                method: method,
                body: JSON.stringify(payload)
            });
            await onSuccess();
        } catch (error) {
            showToast(error.message || "Could not save changes.", true);
        } finally {
            setButtonBusy(button, false);
        }
    }

    async function deleteRecord(path, refresh, label) {
        if (!window.confirm("Delete this " + label + "?")) {
            return;
        }
        try {
            await api(path, { method: "DELETE" });
            await refresh();
            showToast(capitalize(label) + " deleted.");
        } catch (error) {
            showToast(error.message || "Could not delete " + label + ".", true);
        }
    }

    function renderProfile() {
        if (!state.profile) {
            return;
        }
        get("sidebarUser").textContent = state.profile.name || state.profile.email;
        get("userPill").textContent = state.profile.name || "User";
        get("profileName").value = state.profile.name || "";
        get("profileEmail").value = state.profile.email || "";
        renderInsights();
    }

    function renderDashboard() {
        var summary = state.summary || {};
        get("totalIncome").textContent = money(summary.totalIncome);
        get("totalExpense").textContent = money(summary.totalExpense);
        get("balance").textContent = money(summary.balance);
        get("monthlyExpense").textContent = money(summary.monthlyExpense);
        get("topCategory").textContent = summary.topSpendingCategory || "No data";
        renderBars(get("categoryBreakdown"), summary.categoryWiseExpense || {}, "No expenses recorded yet.");
        renderDashboardTrendChart();
        renderInsights();
    }

    function renderBudgetSummary() {
        var container = get("budgetSummaryList");
        var items = state.budgetChecks.slice(0, 4);
        if (!items.length) {
            container.innerHTML = empty("No active budget status yet.");
            renderInsights();
            return;
        }
        container.innerHTML = items.map(function (item) {
            var rawPercent = Number(item.percentageUsed || 0);
            var percent = clamp(rawPercent, 0, 100);
            var exceeded = item.isExceeded || rawPercent > 100;
            var overBy = Math.max(0, Number(item.currentExpense || 0) - Number(item.budgetLimit || 0));
            return [
                '<div class="budget-item ' + budgetStatusClass(rawPercent, exceeded) + '">',
                '<div class="budget-row"><strong>' + budgetCategoryLabel(item.category, exceeded) + '</strong><span>' + rawPercent.toFixed(0) + '%</span></div>',
                '<div class="bar-track budget-progress-track"><div class="bar-fill" style="width:' + percent + '%"></div>' + overflowArrow(exceeded) + '</div>',
                '<div class="budget-row"><span>Spent ' + money(item.currentExpense) + '</span><span>Limit ' + money(item.budgetLimit) + '</span></div>',
                exceeded ? '<div class="budget-exceeded-label">Exceeded by ' + money(overBy) + '</div>' : '',
                '</div>'
            ].join("");
        }).join("");
        renderInsights();
    }

    function renderExpenses() {
        var rows = filteredExpenses();
        var body = get("expenseTableBody");
        var total = rows.length;
        var totalPages = Math.max(1, Math.ceil(total / EXPENSE_PAGE_SIZE));
        state.expensePage = clamp(state.expensePage, 1, totalPages);
        var startIndex = (state.expensePage - 1) * EXPENSE_PAGE_SIZE;
        var pageRows = rows.slice(startIndex, startIndex + EXPENSE_PAGE_SIZE);
        updateExpensePagination(total, startIndex, pageRows.length, totalPages);

        if (!rows.length) {
            body.innerHTML = tableEmpty(5, "No expenses match this view.");
            renderInsights();
            return;
        }

        body.innerHTML = pageRows.map(function (item) {
            return [
                "<tr>",
                "<td><strong>" + esc(item.title) + "</strong><br><small>" + esc(item.description || "") + "</small></td>",
                "<td>" + esc(item.category) + "</td>",
                "<td>" + dateLabel(item.expenseDate) + "</td>",
                '<td class="amount-cell">' + money(item.amount) + "</td>",
                '<td><div class="row-actions">',
                '<button class="small-button" type="button" data-edit-expense="' + item.id + '">Edit</button>',
                '<button class="small-button danger" type="button" data-delete-expense="' + item.id + '">Delete</button>',
                "</div></td>",
                "</tr>"
            ].join("");
        }).join("");

        $all("[data-edit-expense]").forEach(function (button) {
            button.addEventListener("click", function () {
                editExpense(Number(button.dataset.editExpense));
            });
        });
        $all("[data-delete-expense]").forEach(function (button) {
            button.addEventListener("click", function () {
                deleteRecord("/api/expenses/" + button.dataset.deleteExpense, async function () {
                    await Promise.all([loadExpenses(), loadDashboard(), loadBudgetChecks(), loadReport()]);
                }, "expense");
            });
        });
        renderInsights();
    }

    function renderIncomes() {
        var body = get("incomeTableBody");
        if (!state.incomes.length) {
            body.innerHTML = tableEmpty(4, "No income entries yet.");
            renderInsights();
            return;
        }

        body.innerHTML = state.incomes.map(function (item) {
            return [
                "<tr>",
                "<td><strong>" + esc(item.source) + "</strong></td>",
                "<td>" + dateLabel(item.incomeDate) + "</td>",
                '<td class="amount-cell">' + money(item.amount) + "</td>",
                '<td><div class="row-actions">',
                '<button class="small-button" type="button" data-edit-income="' + item.id + '">Edit</button>',
                '<button class="small-button danger" type="button" data-delete-income="' + item.id + '">Delete</button>',
                "</div></td>",
                "</tr>"
            ].join("");
        }).join("");

        $all("[data-edit-income]").forEach(function (button) {
            button.addEventListener("click", function () {
                editIncome(Number(button.dataset.editIncome));
            });
        });
        $all("[data-delete-income]").forEach(function (button) {
            button.addEventListener("click", function () {
                deleteRecord("/api/income/" + button.dataset.deleteIncome, async function () {
                    await Promise.all([loadIncomes(), loadDashboard(), loadReport()]);
                }, "income");
            });
        });
        renderInsights();
    }

    function renderBudgets() {
        var container = get("budgetStatusList");
        if (!state.budgets.length) {
            container.innerHTML = empty("No budgets yet. Add one to track category spending.");
            renderBudgetSummary();
            renderInsights();
            return;
        }

        container.innerHTML = state.budgets.map(function (budget) {
            var check = findBudgetCheck(budget);
            var rawPercent = check ? Number(check.percentageUsed || 0) : 0;
            var percent = clamp(rawPercent, 0, 100);
            var current = check ? Number(check.currentExpense || 0) : 0;
            var limit = Number(budget.limitAmount || 0);
            var remaining = check ? Number(check.remainingAmount || 0) : limit;
            var exceeded = Boolean(check && (check.isExceeded || rawPercent > 100 || current > limit));
            var overBy = Math.max(0, current - limit, Math.abs(Math.min(0, remaining)));
            var status = exceeded ? "over-budget" : (rawPercent >= 80 ? "near-limit" : "under-budget");
            var highlighted = state.budgetHighlight === status ? " route-highlight" : "";
            var remainingClass = exceeded ? ' class="over-budget-text"' : "";
            var remainingLabel = exceeded ? "Over budget" : "Remaining";
            return [
                '<div class="budget-item ' + budgetStatusClass(rawPercent, exceeded) + highlighted + '" data-budget-status="' + status + '">',
                '<div class="budget-row"><strong>' + budgetCategoryLabel(budget.category, exceeded) + '</strong><span>' + monthNames()[budget.month - 1] + ' ' + budget.year + '</span></div>',
                '<div class="bar-track budget-progress-track"><div class="bar-fill" style="width:' + percent + '%"></div>' + overflowArrow(exceeded) + '</div>',
                '<div class="budget-row"><span>Spent ' + money(current) + '</span><span>Limit ' + money(budget.limitAmount) + '</span></div>',
                '<div class="budget-row"><span' + remainingClass + '>' + remainingLabel + ' ' + money(exceeded ? overBy : remaining) + '</span><span>' + rawPercent.toFixed(0) + '% used</span></div>',
                exceeded ? '<div class="budget-exceeded-label">Exceeded by ' + money(overBy) + '</div>' : '',
                '<div class="row-actions">',
                '<button class="small-button" type="button" data-edit-budget="' + budget.id + '">Edit</button>',
                '<button class="small-button danger" type="button" data-delete-budget="' + budget.id + '">Delete</button>',
                '</div>',
                '</div>'
            ].join("");
        }).join("");

        $all("[data-edit-budget]").forEach(function (button) {
            button.addEventListener("click", function () {
                editBudget(Number(button.dataset.editBudget));
            });
        });
        $all("[data-delete-budget]").forEach(function (button) {
            button.addEventListener("click", function () {
                deleteRecord("/api/budgets/" + button.dataset.deleteBudget, async function () {
                    await Promise.all([loadBudgets(), loadBudgetChecks()]);
                }, "budget");
            });
        });

        renderBudgetSummary();
        renderInsights();
    }

    function renderCategories() {
        var body = get("categoryTableBody");
        if (!body) {
            return;
        }
        if (!state.categories.length) {
            body.innerHTML = tableEmpty(3, "No categories yet.");
            renderInsights();
            return;
        }

        body.innerHTML = state.categories.map(function (item) {
            return [
                "<tr>",
                "<td><strong>" + esc(item.name) + "</strong></td>",
                "<td>" + esc(titleCase(item.type)) + "</td>",
                '<td><div class="row-actions">',
                '<button class="small-button" type="button" data-edit-category="' + item.id + '">Edit</button>',
                '<button class="small-button danger" type="button" data-delete-category="' + item.id + '">Delete</button>',
                "</div></td>",
                "</tr>"
            ].join("");
        }).join("");

        $all("[data-edit-category]").forEach(function (button) {
            button.addEventListener("click", function () {
                editCategory(Number(button.dataset.editCategory));
            });
        });
        $all("[data-delete-category]").forEach(function (button) {
            button.addEventListener("click", function () {
                deleteRecord("/api/categories/" + button.dataset.deleteCategory, loadCategories, "category");
            });
        });
        renderInsights();
    }

    function renderCategoryInputs() {
        var expenseCategories = state.categories.filter(function (item) {
            return item.type === "EXPENSE";
        });
        var incomeCategories = state.categories.filter(function (item) {
            return item.type === "INCOME";
        });

        var datalist = get("expenseCategoryList");
        datalist.innerHTML = expenseCategories.map(function (item) {
            return '<option value="' + esc(item.name) + '"></option>';
        }).join("");

        var select = get("expenseFilterCategory");
        var selected = select.value;
        select.innerHTML = '<option value="">All categories</option>' + expenseCategories.map(function (item) {
            return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>';
        }).join("");
        select.value = selected;

        var incomeSelect = get("incomeCategory");
        var incomeSelected = incomeSelect.value;
        incomeSelect.innerHTML = '<option value="">Select category</option>' + incomeCategories.map(function (item) {
            return '<option value="' + esc(item.name) + '">' + esc(item.name) + '</option>';
        }).join("");
        incomeSelect.value = incomeSelected;
    }

    function renderReport(report) {
        report = report || {};
        state.report = report;
        get("reportIncome").textContent = money(report.totalIncome);
        get("reportExpense").textContent = money(report.totalExpense);
        renderBars(get("reportBreakdown"), report.expenseByCategory || {}, "No spending for this month.");
        renderBars(get("reportIncomeBreakdown"), report.incomeByCategory || {}, "No income for this month.");
        renderReportMonthlyChart();
        renderInsights();
    }

    function renderInsights() {
        if (!get("healthScore")) {
            return;
        }

        var insight = buildInsights();
        get("healthScore").textContent = insight.score;
        get("healthScoreRing").style.background = "conic-gradient(" + insight.color + " " + (insight.score * 3.6) + "deg, #e2e8f0 0deg)";
        get("healthScoreLabel").textContent = insight.label;
        get("healthScoreText").textContent = insight.summary;
        get("insightSavingsRate").textContent = insight.savingsRateLabel;
        get("insightProjection").textContent = money(insight.projectedMonthSpend);
        get("dashboardInsightText").textContent = insight.summary;

        var recommendations = insight.recommendations;
        get("recommendationList").innerHTML = recommendations.length
            ? recommendations.map(renderRecommendation).join("")
            : empty("No recommendations yet. Add income, expenses, and budgets to unlock smarter guidance.");
        bindRecommendationActions();

        get("signalList").innerHTML = insight.signals.map(function (signal) {
            return [
                '<div class="signal-item">',
                '<div><strong>' + esc(signal.label) + '</strong><p>' + esc(signal.help) + '</p></div>',
                '<span class="signal-value">' + esc(signal.value) + '</span>',
                '</div>'
            ].join("");
        }).join("");

        renderGoalSimulator();
    }

    function buildInsights() {
        var now = new Date();
        var currentMonth = now.getMonth();
        var currentYear = now.getFullYear();
        var monthExpenses = state.expenses.filter(function (item) {
            var date = parseDate(item.expenseDate);
            return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
        var monthIncomes = state.incomes.filter(function (item) {
            var date = parseDate(item.incomeDate);
            return date && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        var monthlyExpense = sum(monthExpenses, "amount");
        var monthlyIncome = sum(monthIncomes, "amount");
        var monthlySavings = monthlyIncome - monthlyExpense;
        var savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;
        var projectedMonthSpend = projectMonthSpend(monthExpenses, now);
        var budgetExceeded = state.budgetChecks.filter(function (item) {
            return item.isExceeded;
        });
        var budgetNearLimit = state.budgetChecks.filter(function (item) {
            return !item.isExceeded && Number(item.percentageUsed || 0) >= 80;
        });
        var topCategory = topCategoryFor(monthExpenses);
        var topShare = monthlyExpense > 0 && topCategory ? (topCategory.amount / monthlyExpense) * 100 : 0;

        var score = 100;
        if (monthlyIncome <= 0) {
            score -= 22;
        }
        if (savingsRate < 0) {
            score -= 25;
        } else if (savingsRate < 10) {
            score -= 15;
        } else if (savingsRate < 20) {
            score -= 8;
        }
        score -= Math.min(24, budgetExceeded.length * 12);
        score -= Math.min(12, budgetNearLimit.length * 4);
        if (topShare > 50) {
            score -= 8;
        }
        if (!state.budgets.length) {
            score -= 8;
        }
        score = clamp(Math.round(score), 0, 100);

        var label = score >= 80 ? "Strong control" : score >= 60 ? "Stable with watchpoints" : score >= 40 ? "Needs attention" : "High risk";
        var color = score >= 80 ? "#0f8b5f" : score >= 60 ? "#2563a8" : score >= 40 ? "#b7791f" : "#c2413a";
        var recommendations = [];

        if (monthlyIncome <= 0) {
            recommendations.push(rec("warning", "Add this month's income", "Your savings rate and projections become much more useful once income is recorded.", "income"));
        }
        if (savingsRate < 0 && monthlyIncome > 0) {
            recommendations.push(rec("danger", "Pause non-essential spending", "This month is currently running negative by " + money(Math.abs(monthlySavings)) + ".", "expenses"));
        } else if (savingsRate < 20 && monthlyIncome > 0) {
            recommendations.push(rec("warning", "Raise savings toward 20%", "Your current monthly savings rate is " + percent(savingsRate) + ". A 20% target would leave more room for goals.", "reports"));
        } else if (monthlyIncome > 0) {
            recommendations.push(rec("good", "Savings habit looks healthy", "You are keeping " + percent(savingsRate) + " of this month's income after expenses.", "healthy-report"));
        }
        if (budgetExceeded.length) {
            recommendations.push(rec("danger", "Fix exceeded budgets", budgetExceeded.map(function (item) { return item.category; }).join(", ") + " crossed the planned limit.", "fix-budgets"));
        }
        if (budgetNearLimit.length) {
            recommendations.push(rec("warning", "Watch near-limit budgets", budgetNearLimit.map(function (item) { return item.category; }).join(", ") + " is already above 80% used.", "watch-budgets"));
        }
        if (topCategory && topShare > 45) {
            recommendations.push(rec("warning", "Review concentration risk", topCategory.name + " is " + percent(topShare) + " of this month's spending.", "review-concentration"));
        }
        if (!state.budgets.length) {
            recommendations.push(rec("warning", "Create category budgets", "Budgets unlock stronger alerts and help the finance coach catch risks earlier.", "budgets"));
        }
        if (!state.categories.length) {
            recommendations.push(rec("warning", "Add reusable categories", "Categories make reports clearer and reduce typing while adding transactions.", "categories"));
        }

        var runway = monthlyExpense > 0 && state.summary ? Number(state.summary.balance || 0) / monthlyExpense : 0;
        var summary = label + ": " + (monthlyIncome > 0
            ? "you are saving " + percent(savingsRate) + " this month with projected spending of " + money(projectedMonthSpend) + "."
            : "add income to unlock complete savings guidance.");

        return {
            score: score,
            label: label,
            color: color,
            summary: summary,
            savingsRateLabel: monthlyIncome > 0 ? percent(savingsRate) : "No income",
            projectedMonthSpend: projectedMonthSpend,
            recommendations: recommendations.slice(0, 6),
            signals: [
                { label: "This month income", value: money(monthlyIncome), help: "Income entries dated in the current month." },
                { label: "This month expenses", value: money(monthlyExpense), help: "Expense entries dated in the current month." },
                { label: "Budget alerts", value: String(budgetExceeded.length + budgetNearLimit.length), help: "Exceeded or near-limit category budgets." },
                { label: "Runway estimate", value: runway > 0 ? runway.toFixed(1) + " months" : "Not ready", help: "Current balance divided by this month's spending." }
            ]
        };
    }

    function renderRecommendation(item) {
        return [
            '<div class="recommendation-item ' + esc(item.type) + '">',
            '<strong>' + esc(item.title) + '</strong>',
            '<p>' + esc(item.detail) + '</p>',
            '</div>'
        ].join("");
    }

    function renderGoalSimulator() {
        if (!get("goalResult")) {
            return;
        }
        var goal = Number(get("goalAmount").value || 0);
        var contribution = Number(get("goalContribution").value || 0);
        if (goal <= 0 || contribution <= 0) {
            get("goalResult").textContent = "Enter a positive goal and monthly contribution to calculate the timeline.";
            return;
        }

        var months = Math.ceil(goal / contribution);
        var years = Math.floor(months / 12);
        var remainingMonths = months % 12;
        var timeline = years > 0 ? years + " yr " + remainingMonths + " mo" : months + " mo";
        get("goalResult").textContent = "At " + money(contribution) + " per month, " + money(goal) + " takes about " + timeline + ".";
    }

    function rec(type, title, detail) {
        return { type: type, title: title, detail: detail };
    }

    function renderBars(container, values, emptyMessage) {
        var entries = Object.keys(values).map(function (key) {
            return [key, Number(values[key] || 0)];
        }).sort(function (a, b) {
            return b[1] - a[1];
        });

        if (!entries.length) {
            container.innerHTML = empty(emptyMessage);
            return;
        }

        var max = entries.reduce(function (highest, entry) {
            return Math.max(highest, entry[1]);
        }, 0);

        container.innerHTML = entries.map(function (entry) {
            var width = max > 0 ? (entry[1] / max) * 100 : 0;
            return [
                '<div class="bar-item">',
                '<div class="bar-meta"><span>' + esc(entry[0]) + '</span><span>' + money(entry[1]) + '</span></div>',
                '<div class="bar-track"><div class="bar-fill" style="width:' + width + '%"></div></div>',
                '</div>'
            ].join("");
        }).join("");
    }

    function editExpense(id) {
        var item = state.expenses.find(function (expense) {
            return expense.id === id;
        });
        if (!item) {
            return;
        }
        get("expenseId").value = item.id;
        get("expenseTitle").value = item.title || "";
        get("expenseAmount").value = item.amount || "";
        get("expenseCategory").value = item.category || "";
        get("expenseDate").value = item.expenseDate || "";
        get("expenseDescription").value = item.description || "";
        get("expenseFormTitle").textContent = "Edit expense";
        switchView("expenses");
    }

    function editIncome(id) {
        var item = state.incomes.find(function (income) {
            return income.id === id;
        });
        if (!item) {
            return;
        }
        get("incomeId").value = item.id;
        get("incomeSource").value = item.source || "";
        get("incomeAmount").value = item.amount || "";
        get("incomeDate").value = item.incomeDate || "";
        get("incomeFormTitle").textContent = "Edit income";
        switchView("income");
    }

    function editBudget(id) {
        var item = state.budgets.find(function (budget) {
            return budget.id === id;
        });
        if (!item) {
            return;
        }
        get("budgetId").value = item.id;
        get("budgetCategory").value = item.category || "";
        get("budgetLimitAmount").value = item.limitAmount || "";
        get("budgetMonth").value = item.month || "";
        get("budgetYear").value = item.year || "";
        get("budgetFormTitle").textContent = "Edit budget";
        switchView("budgets");
    }

    function editCategory(id) {
        var item = state.categories.find(function (category) {
            return category.id === id;
        });
        if (!item) {
            return;
        }
        get("categoryId").value = item.id;
        get("categoryName").value = item.name || "";
        get("categoryType").value = item.type || "EXPENSE";
        get("categoryFormTitle").textContent = "Edit category";
        switchView("categories");
    }

    function resetExpenseForm() {
        get("expenseForm").reset();
        get("expenseId").value = "";
        get("expenseDate").value = toDateInput(new Date());
        get("expenseFormTitle").textContent = "Add expense";
    }

    function resetIncomeForm() {
        get("incomeForm").reset();
        get("incomeId").value = "";
        get("incomeDate").value = toDateInput(new Date());
        get("incomeFormTitle").textContent = "Add income";
    }

    function resetBudgetForm() {
        var now = new Date();
        get("budgetForm").reset();
        get("budgetId").value = "";
        get("budgetMonth").value = now.getMonth() + 1;
        get("budgetYear").value = now.getFullYear();
        get("budgetFormTitle").textContent = "Add budget";
    }

    function resetCategoryForm() {
        get("categoryForm").reset();
        get("categoryId").value = "";
        get("categoryType").value = "EXPENSE";
        get("categoryFormTitle").textContent = "Add category";
    }

    function filteredExpenses() {
        var category = get("expenseFilterCategory").value;
        var start = get("expenseFilterStart").value;
        var end = get("expenseFilterEnd").value;

        return state.expenses.filter(function (item) {
            if (category && item.category !== category) {
                return false;
            }
            if (start && item.expenseDate < start) {
                return false;
            }
            if (end && item.expenseDate > end) {
                return false;
            }
            return true;
        });
    }

    function findBudgetCheck(budget) {
        return state.budgetChecks.find(function (item) {
            return item.category === budget.category;
        });
    }

    function setButtonBusy(button, busy) {
        if (!button) {
            return;
        }
        if (busy) {
            button.dataset.originalText = button.textContent;
            button.textContent = "Please wait";
            button.disabled = true;
        } else {
            button.textContent = button.dataset.originalText || button.textContent;
            button.disabled = false;
        }
    }

    function showAlert(id, message, isSuccess) {
        var element = get(id);
        if (!message) {
            element.hidden = true;
            element.textContent = "";
            element.classList.remove("success");
            return;
        }
        element.hidden = false;
        element.classList.toggle("success", Boolean(isSuccess));
        element.textContent = message;
    }

    function setResetResult(resetUrl, expiresAt) {
        var result = get("forgotPasswordResult");
        if (!result) {
            return;
        }
        if (!resetUrl) {
            result.hidden = true;
            result.innerHTML = "";
            return;
        }
        var expiry = expiresAt ? "Expires at " + esc(expiresAt.replace("T", " ").slice(0, 16)) + "." : "This link expires soon.";
        result.hidden = false;
        result.innerHTML = [
            "<strong>Local development reset link</strong>",
            "<p>Email delivery is not configured in this project, so the demo link is shown here.</p>",
            '<a class="reset-link" href="' + esc(resetUrl) + '">' + esc(resetUrl) + "</a>",
            "<small>" + expiry + "</small>"
        ].join("");
    }

    function showToast(message, isError) {
        var toast = get("toast");
        if (!toast) {
            return;
        }
        window.clearTimeout(showToast.timer);
        toast.hidden = false;
        toast.classList.toggle("error", Boolean(isError));
        toast.textContent = message;
        showToast.timer = window.setTimeout(function () {
            toast.hidden = true;
        }, 3200);
    }

    function money(value) {
        var amount = Number(value || 0);
        return amount.toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        });
    }

    function dateLabel(value) {
        if (!value) {
            return "-";
        }
        return new Date(value + "T00:00:00").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }
        return new Date(value + "T00:00:00");
    }

    function sum(items, field) {
        return items.reduce(function (total, item) {
            return total + Number(item[field] || 0);
        }, 0);
    }

    function projectMonthSpend(expenses, date) {
        var spent = sum(expenses, "amount");
        var elapsed = Math.max(1, date.getDate());
        var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
        return spent > 0 ? (spent / elapsed) * lastDay : 0;
    }

    function topCategoryFor(expenses) {
        var totals = expenses.reduce(function (map, item) {
            var category = item.category || "Uncategorized";
            map[category] = (map[category] || 0) + Number(item.amount || 0);
            return map;
        }, {});
        var names = Object.keys(totals);
        if (!names.length) {
            return null;
        }
        return names.map(function (name) {
            return { name: name, amount: totals[name] };
        }).sort(function (a, b) {
            return b.amount - a.amount;
        })[0];
    }

    function percent(value) {
        return Number(value || 0).toFixed(0) + "%";
    }

    function toDateInput(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    function monthNames() {
        return ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    }

    function empty(message) {
        return '<div class="empty-state">' + esc(message) + '</div>';
    }

    function tableEmpty(colspan, message) {
        return '<tr><td colspan="' + colspan + '"><div class="empty-state">' + esc(message) + '</div></td></tr>';
    }

    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function titleCase(value) {
        return String(value || "").toLowerCase().replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });
    }

    function capitalize(value) {
        return String(value || "").charAt(0).toUpperCase() + String(value || "").slice(1);
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
})();
