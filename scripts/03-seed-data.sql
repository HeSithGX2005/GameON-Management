-- Insert sample admin user (you'll need to create this user in Supabase Auth first)
-- Replace 'admin-uuid-here' with actual UUID from auth.users
INSERT INTO profiles (id, email, full_name, role, department, hire_date) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@company.com', 'System Administrator', 'admin', 'IT', '2024-01-01'),
('00000000-0000-0000-0000-000000000002', 'john.doe@company.com', 'John Doe', 'employee', 'Development', '2024-01-15'),
('00000000-0000-0000-0000-000000000003', 'jane.smith@company.com', 'Jane Smith', 'employee', 'Design', '2024-02-01');

-- Insert sample projects
INSERT INTO projects (id, name, description, start_date, end_date, status, created_by) VALUES
('10000000-0000-0000-0000-000000000001', 'Employee Management System', 'Build a comprehensive EMS', '2024-01-01', '2024-06-30', 'active', '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000002', 'Website Redesign', 'Redesign company website', '2024-02-01', '2024-04-30', 'planning', '00000000-0000-0000-0000-000000000001');

-- Insert sample milestones
INSERT INTO milestones (project_id, name, description, due_date) VALUES
('10000000-0000-0000-0000-000000000001', 'MVP Release', 'Minimum viable product', '2024-03-31'),
('10000000-0000-0000-0000-000000000001', 'Beta Testing', 'User acceptance testing', '2024-05-31');

-- Insert sample tasks
INSERT INTO tasks (project_id, milestone_id, title, description, status, due_date, estimated_hours, created_by) VALUES
('10000000-0000-0000-0000-000000000001', (SELECT id FROM milestones WHERE name = 'MVP Release'), 'Setup Authentication', 'Implement user login/logout', 'in_progress', '2024-02-15', 16, '00000000-0000-0000-0000-000000000001'),
('10000000-0000-0000-0000-000000000001', (SELECT id FROM milestones WHERE name = 'MVP Release'), 'Create Dashboard', 'Build main dashboard UI', 'todo', '2024-02-28', 24, '00000000-0000-0000-0000-000000000001');

-- Insert project assignments
INSERT INTO project_assignments (project_id, user_id) VALUES
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'),
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- Insert task assignments
INSERT INTO task_assignments (task_id, user_id) VALUES
((SELECT id FROM tasks WHERE title = 'Setup Authentication'), '00000000-0000-0000-0000-000000000002'),
((SELECT id FROM tasks WHERE title = 'Create Dashboard'), '00000000-0000-0000-0000-000000000003');
