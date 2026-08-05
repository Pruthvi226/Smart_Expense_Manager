-- Database Indexes & Performance Optimizations

-- User indexes
CREATE INDEX idx_users_email ON users(email);

-- Expense indexes for filtering, sorting & pagination
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_expenses_expense_date ON expenses(expense_date);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_expenses_user_category ON expenses(user_id, category);

-- Budget indexes for month/year queries
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_user_month_year ON budgets(user_id, month, year);
CREATE INDEX idx_budgets_user_category ON budgets(user_id, category);

-- Income indexes
CREATE INDEX idx_incomes_user_id ON incomes(user_id);
CREATE INDEX idx_incomes_income_date ON incomes(income_date);

-- Audit log & Notification indexes
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_correlation_id ON audit_logs(correlation_id);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read);
