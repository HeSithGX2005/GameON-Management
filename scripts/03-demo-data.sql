-- Note: You'll need to create these users in Supabase Auth first, then update the UUIDs below
-- For demo purposes, we'll use placeholder UUIDs that you should replace with actual auth.users IDs

-- Demo users (replace these UUIDs with actual ones from Supabase Auth after creating the users)
-- Admin user: admin@company.com / password: admin123
-- Employee user: john.doe@company.com / password: employee123

INSERT INTO profiles (id, email, full_name, role, department, hire_date, phone) VALUES
-- Replace these UUIDs with actual ones from your Supabase Auth users
('11111111-1111-1111-1111-111111111111', 'admin@company.com', 'Admin User', 'admin', 'Management', '2024-01-01', '+1-555-0101'),
('22222222-2222-2222-2222-222222222222', 'john.doe@company.com', 'John Doe', 'employee', 'Development', '2024-01-15', '+1-555-0102'),
('33333333-3333-3333-3333-333333333333', 'jane.smith@company.com', 'Jane Smith', 'employee', 'Design', '2024-02-01', '+1-555-0103'),
('44444444-4444-4444-4444-444444444444', 'mike.wilson@company.com', 'Mike Wilson', 'employee', 'Development', '2024-02-15', '+1-555-0104');

-- Demo projects
INSERT INTO projects (id, name, description, start_date, end_date, status, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Employee Management System', 'Build a comprehensive employee management platform', '2024-01-01', '2024-06-30', 'active', '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Website Redesign', 'Redesign company website with modern UI/UX', '2024-02-01', '2024-04-30', 'active', '11111111-1111-1111-1111-111111111111'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Mobile App Development', 'Develop mobile app for employee portal', '2024-03-01', '2024-08-31', 'planning', '11111111-1111-1111-1111-111111111111');

-- Demo milestones
INSERT INTO milestones (project_id, name, description, due_date) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'MVP Release', 'Minimum viable product with core features', '2024-03-31'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Beta Testing', 'User acceptance testing phase', '2024-05-31'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Design Phase', 'Complete UI/UX design mockups', '2024-03-15'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Development Phase', 'Frontend and backend development', '2024-04-15');

-- Demo tasks
INSERT INTO tasks (project_id, milestone_id, title, description, status, due_date, estimated_hours, priority, created_by) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM milestones WHERE name = 'MVP Release' LIMIT 1), 'Setup Authentication System', 'Implement user login/logout with role-based access', 'in_progress', '2024-02-15', 16, 1, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM milestones WHERE name = 'MVP Release' LIMIT 1), 'Create Dashboard UI', 'Build responsive dashboard with key metrics', 'todo', '2024-02-28', 24, 2, '11111111-1111-1111-1111-111111111111'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', (SELECT id FROM milestones WHERE name = 'MVP Release' LIMIT 1), 'Implement Attendance Tracking', 'Clock in/out functionality with validation', 'todo', '2024-03-10', 20, 1, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM milestones WHERE name = 'Design Phase' LIMIT 1), 'Create Wireframes', 'Design wireframes for all main pages', 'done', '2024-02-20', 12, 2, '11111111-1111-1111-1111-111111111111'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', (SELECT id FROM milestones WHERE name = 'Design Phase' LIMIT 1), 'Design System Setup', 'Create design system and component library', 'in_progress', '2024-03-05', 16, 1, '11111111-1111-1111-1111-111111111111');

-- Demo project assignments
INSERT INTO project_assignments (project_id, user_id) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222'),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '44444444-4444-4444-4444-444444444444'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222');

-- Demo task assignments
INSERT INTO task_assignments (task_id, user_id) VALUES
((SELECT id FROM tasks WHERE title = 'Setup Authentication System'), '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM tasks WHERE title = 'Create Dashboard UI'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM tasks WHERE title = 'Implement Attendance Tracking'), '22222222-2222-2222-2222-222222222222'),
((SELECT id FROM tasks WHERE title = 'Create Wireframes'), '33333333-3333-3333-3333-333333333333'),
((SELECT id FROM tasks WHERE title = 'Design System Setup'), '33333333-3333-3333-3333-333333333333');

-- Demo attendance records (last 7 days)
INSERT INTO attendance (user_id, clock_in, clock_out, total_hours, date) VALUES
('22222222-2222-2222-2222-222222222222', '2024-01-15 09:00:00+00', '2024-01-15 17:30:00+00', 8.5, '2024-01-15'),
('22222222-2222-2222-2222-222222222222', '2024-01-16 08:45:00+00', '2024-01-16 17:15:00+00', 8.5, '2024-01-16'),
('33333333-3333-3333-3333-333333333333', '2024-01-15 09:15:00+00', '2024-01-15 18:00:00+00', 8.75, '2024-01-15'),
('33333333-3333-3333-3333-333333333333', '2024-01-16 09:00:00+00', '2024-01-16 17:45:00+00', 8.75, '2024-01-16'),
('44444444-4444-4444-4444-444444444444', '2024-01-15 08:30:00+00', '2024-01-15 17:00:00+00', 8.5, '2024-01-15');

-- Demo leave requests
INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, days_requested, reason, status) VALUES
('22222222-2222-2222-2222-222222222222', 'vacation', '2024-03-01', '2024-03-05', 5, 'Family vacation', 'pending'),
('33333333-3333-3333-3333-333333333333', 'sick', '2024-02-20', '2024-02-20', 1, 'Doctor appointment', 'approved'),
('44444444-4444-4444-4444-444444444444', 'personal', '2024-02-25', '2024-02-26', 2, 'Personal matters', 'pending');
