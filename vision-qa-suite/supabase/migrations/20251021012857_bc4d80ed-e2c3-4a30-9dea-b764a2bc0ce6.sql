-- Create enum types
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.test_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.test_status AS ENUM ('not_run', 'passed', 'failed', 'blocked', 'skipped');
CREATE TYPE public.test_type AS ENUM ('manual', 'automation', 'smoke', 'regression', 'api', 'ui', 'security');
CREATE TYPE public.bug_severity AS ENUM ('minor', 'major', 'critical', 'blocker');
CREATE TYPE public.bug_status AS ENUM ('open', 'in_progress', 'fixed', 'retest', 'closed');
CREATE TYPE public.project_status AS ENUM ('active', 'completed', 'archived');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status project_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_suites table
CREATE TABLE public.test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_cases table
CREATE TABLE public.test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_suite_id UUID REFERENCES public.test_suites(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  steps TEXT,
  expected_result TEXT,
  actual_result TEXT,
  priority test_priority NOT NULL DEFAULT 'medium',
  status test_status NOT NULL DEFAULT 'not_run',
  type test_type NOT NULL DEFAULT 'manual',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create test_runs table
CREATE TABLE public.test_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_suite_id UUID REFERENCES public.test_suites(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  total_cases INTEGER NOT NULL DEFAULT 0,
  passed INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  skipped INTEGER NOT NULL DEFAULT 0,
  blocked INTEGER NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  executed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bug_reports table
CREATE TABLE public.bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  test_case_id UUID REFERENCES public.test_cases(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity bug_severity NOT NULL DEFAULT 'major',
  priority test_priority NOT NULL DEFAULT 'medium',
  status bug_status NOT NULL DEFAULT 'open',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  
  -- Insert default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON public.test_suites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON public.test_cases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bug_reports_updated_at BEFORE UPDATE ON public.bug_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for test_suites
CREATE POLICY "Users can view test suites of own projects" ON public.test_suites FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_suites.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create test suites in own projects" ON public.test_suites FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_suites.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update test suites in own projects" ON public.test_suites FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_suites.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete test suites in own projects" ON public.test_suites FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_suites.project_id AND projects.user_id = auth.uid())
);

-- RLS Policies for test_cases
CREATE POLICY "Users can view test cases of own projects" ON public.test_cases FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_cases.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create test cases in own projects" ON public.test_cases FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_cases.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update test cases in own projects" ON public.test_cases FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_cases.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete test cases in own projects" ON public.test_cases FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_cases.project_id AND projects.user_id = auth.uid())
);

-- RLS Policies for test_runs
CREATE POLICY "Users can view test runs of own projects" ON public.test_runs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_runs.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create test runs in own projects" ON public.test_runs FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_runs.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update test runs in own projects" ON public.test_runs FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_runs.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete test runs in own projects" ON public.test_runs FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = test_runs.project_id AND projects.user_id = auth.uid())
);

-- RLS Policies for bug_reports
CREATE POLICY "Users can view bug reports of own projects" ON public.bug_reports FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = bug_reports.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can create bug reports in own projects" ON public.bug_reports FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = bug_reports.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update bug reports in own projects" ON public.bug_reports FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = bug_reports.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete bug reports in own projects" ON public.bug_reports FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE projects.id = bug_reports.project_id AND projects.user_id = auth.uid())
);