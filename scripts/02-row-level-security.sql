-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Projects policies
CREATE POLICY "Users can view assigned projects" ON projects FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_assignments 
        WHERE project_id = projects.id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage projects" ON projects FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Milestones policies
CREATE POLICY "Users can view milestones for assigned projects" ON milestones FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM project_assignments 
        WHERE project_id = milestones.project_id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage milestones" ON milestones FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Tasks policies
CREATE POLICY "Users can view assigned tasks" ON tasks FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM task_assignments 
        WHERE task_id = tasks.id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM project_assignments 
        WHERE project_id = tasks.project_id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can update assigned tasks" ON tasks FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM task_assignments 
        WHERE task_id = tasks.id AND user_id = auth.uid()
    ) OR
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Admins can manage tasks" ON tasks FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Project assignments policies
CREATE POLICY "Users can view project assignments" ON project_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage project assignments" ON project_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Task assignments policies
CREATE POLICY "Users can view task assignments" ON task_assignments FOR SELECT USING (true);
CREATE POLICY "Admins can manage task assignments" ON task_assignments FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Attendance policies
CREATE POLICY "Users can view own attendance" ON attendance FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own attendance" ON attendance FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own attendance" ON attendance FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all attendance" ON attendance FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Leave requests policies
CREATE POLICY "Users can view own leave requests" ON leave_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own leave requests" ON leave_requests FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pending leave requests" ON leave_requests FOR UPDATE USING (
    user_id = auth.uid() AND status = 'pending'
);
CREATE POLICY "Admins can manage all leave requests" ON leave_requests FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
