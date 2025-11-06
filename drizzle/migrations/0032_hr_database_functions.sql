-- Migration: HR Database Functions
-- Created: 2025-01-28
-- Description: PostgreSQL functions for payroll calculations, leave calculations, attendance aggregation, and time tracking

-- ============================================
-- PAYROLL CALCULATION FUNCTIONS
-- ============================================

-- Calculate Gross Pay
CREATE OR REPLACE FUNCTION calculate_gross_pay(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_pay_period_start TIMESTAMP WITH TIME ZONE,
  p_pay_period_end TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_gross_pay NUMERIC := 0;
  v_hours_worked NUMERIC;
  v_hourly_rate NUMERIC;
  v_salary_amount NUMERIC;
  v_pay_frequency TEXT;
  v_regular_hours NUMERIC;
  v_overtime_hours NUMERIC;
BEGIN
  -- Get employee/contractor details
  IF p_employee_id IS NOT NULL THEN
    SELECT e.salary, e.pay_frequency, e.default_work_hours * 2
    INTO v_salary_amount, v_pay_frequency, v_regular_hours
    FROM employees e
    WHERE e.id = p_employee_id;
    
    -- Calculate from time entries or salary
    IF v_pay_frequency = 'hourly' THEN
      SELECT COALESCE(SUM(te.duration), 0), COALESCE(AVG(te.hourly_rate), 0)
      INTO v_hours_worked, v_hourly_rate
      FROM time_entries te
      WHERE te.employee_id = p_employee_id
        AND te.start_time >= p_pay_period_start
        AND te.start_time < p_pay_period_end
        AND te.status = 'completed';
      
      -- Calculate overtime (assuming 40 hours per week threshold)
      v_regular_hours := LEAST(v_hours_worked, 40);
      v_overtime_hours := GREATEST(0, v_hours_worked - 40);
      
      v_gross_pay := (v_regular_hours * v_hourly_rate) + (v_overtime_hours * v_hourly_rate * 1.5);
    ELSE
      -- Salary-based calculation
      IF v_pay_frequency = 'weekly' THEN
        v_gross_pay := COALESCE(v_salary_amount, 0) / 52;
      ELSIF v_pay_frequency = 'biweekly' THEN
        v_gross_pay := COALESCE(v_salary_amount, 0) / 26;
      ELSIF v_pay_frequency = 'monthly' THEN
        v_gross_pay := COALESCE(v_salary_amount, 0) / 12;
      ELSE
        v_gross_pay := COALESCE(v_salary_amount, 0);
      END IF;
    END IF;
  ELSIF p_contractor_id IS NOT NULL THEN
    SELECT COALESCE(SUM(te.duration), 0), COALESCE(AVG(te.hourly_rate), hc.hourly_rate)
    INTO v_hours_worked, v_hourly_rate
    FROM time_entries te
    RIGHT JOIN hr_contractors hc ON hc.id = p_contractor_id
    WHERE (te.contractor_id = p_contractor_id OR te.contractor_id IS NULL)
      AND (te.start_time >= p_pay_period_start OR te.start_time IS NULL)
      AND (te.start_time < p_pay_period_end OR te.start_time IS NULL)
      AND (te.status = 'completed' OR te.status IS NULL);
    
    v_gross_pay := COALESCE(v_hours_worked * v_hourly_rate, 0);
  END IF;
  
  RETURN COALESCE(v_gross_pay, 0);
END;
$$ LANGUAGE plpgsql;

-- Calculate Taxes
CREATE OR REPLACE FUNCTION calculate_taxes(
  p_gross_pay NUMERIC,
  p_tax_config JSONB
) RETURNS JSONB AS $$
DECLARE
  v_taxes JSONB := '[]'::JSONB;
  v_tax_record JSONB;
  v_tax_amount NUMERIC;
  v_rate NUMERIC;
  v_wage_base NUMERIC;
BEGIN
  -- Federal Income Tax (simplified - would use actual tax brackets in production)
  IF p_tax_config->>'federal_rate' IS NOT NULL THEN
    v_rate := (p_tax_config->>'federal_rate')::NUMERIC;
    v_tax_amount := p_gross_pay * v_rate;
    v_tax_record := jsonb_build_object(
      'type', 'federal_income',
      'amount', v_tax_amount,
      'rate', v_rate
    );
    v_taxes := v_taxes || v_tax_record;
  END IF;
  
  -- Social Security (6.2% up to wage base)
  v_wage_base := COALESCE((p_tax_config->>'social_security_wage_base')::NUMERIC, 160200);
  v_tax_amount := LEAST(p_gross_pay, v_wage_base) * 0.062;
  v_tax_record := jsonb_build_object(
    'type', 'social_security',
    'amount', v_tax_amount,
    'rate', 0.062
  );
  v_taxes := v_taxes || v_tax_record;
  
  -- Medicare (1.45% on all wages)
  v_tax_amount := p_gross_pay * 0.0145;
  v_tax_record := jsonb_build_object(
    'type', 'medicare',
    'amount', v_tax_amount,
    'rate', 0.0145
  );
  v_taxes := v_taxes || v_tax_record;
  
  RETURN v_taxes;
END;
$$ LANGUAGE plpgsql;

-- Calculate Deductions
CREATE OR REPLACE FUNCTION calculate_deductions(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_gross_pay NUMERIC
) RETURNS JSONB AS $$
DECLARE
  v_deductions JSONB := '[]'::JSONB;
  v_deduction_record JSONB;
  v_deduction RECORD;
  v_amount NUMERIC;
BEGIN
  FOR v_deduction IN
    SELECT * FROM payroll_deductions
    WHERE (employee_id = p_employee_id OR contractor_id = p_contractor_id)
      AND is_active = true
      AND (start_date IS NULL OR start_date <= CURRENT_DATE)
      AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  LOOP
    IF v_deduction.amount_type = 'fixed' THEN
      v_amount := COALESCE(v_deduction.amount, 0);
    ELSIF v_deduction.amount_type = 'percentage' THEN
      v_amount := p_gross_pay * (COALESCE(v_deduction.percentage, 0) / 100);
    END IF;
    
    -- Apply min/max limits
    IF v_deduction.min_amount IS NOT NULL THEN
      v_amount := GREATEST(v_amount, v_deduction.min_amount);
    END IF;
    IF v_deduction.max_amount IS NOT NULL THEN
      v_amount := LEAST(v_amount, v_deduction.max_amount);
    END IF;
    
    v_deduction_record := jsonb_build_object(
      'id', v_deduction.id,
      'name', v_deduction.name,
      'type', v_deduction.type,
      'amount', v_amount
    );
    v_deductions := v_deductions || v_deduction_record;
  END LOOP;
  
  RETURN v_deductions;
END;
$$ LANGUAGE plpgsql;

-- Calculate Net Pay
CREATE OR REPLACE FUNCTION calculate_net_pay(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_pay_period_start TIMESTAMP WITH TIME ZONE,
  p_pay_period_end TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_gross_pay NUMERIC;
  v_total_taxes NUMERIC := 0;
  v_total_deductions NUMERIC := 0;
  v_taxes JSONB;
  v_deductions JSONB;
  v_tax_item JSONB;
  v_deduction_item JSONB;
BEGIN
  -- Get gross pay
  v_gross_pay := calculate_gross_pay(p_employee_id, p_contractor_id, p_pay_period_start, p_pay_period_end);
  
  -- Calculate taxes (simplified config)
  v_taxes := calculate_taxes(v_gross_pay, '{"federal_rate": 0.15}'::JSONB);
  FOR v_tax_item IN SELECT * FROM jsonb_array_elements(v_taxes)
  LOOP
    v_total_taxes := v_total_taxes + (v_tax_item->>'amount')::NUMERIC;
  END LOOP;
  
  -- Calculate deductions
  v_deductions := calculate_deductions(p_employee_id, p_contractor_id, v_gross_pay);
  FOR v_deduction_item IN SELECT * FROM jsonb_array_elements(v_deductions)
  LOOP
    v_total_deductions := v_total_deductions + (v_deduction_item->>'amount')::NUMERIC;
  END LOOP;
  
  RETURN v_gross_pay - v_total_taxes - v_total_deductions;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- LEAVE MANAGEMENT FUNCTIONS
-- ============================================

-- Calculate Leave Balance
CREATE OR REPLACE FUNCTION calculate_leave_balance(
  p_employee_id UUID,
  p_leave_type_id UUID,
  p_as_of_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
) RETURNS NUMERIC AS $$
DECLARE
  v_balance NUMERIC;
BEGIN
  SELECT current_balance
  INTO v_balance
  FROM leave_balances
  WHERE employee_id = p_employee_id
    AND leave_type_id = p_leave_type_id
    AND (period_start IS NULL OR period_start <= p_as_of_date)
    AND (period_end IS NULL OR period_end >= p_as_of_date);
  
  RETURN COALESCE(v_balance, 0);
END;
$$ LANGUAGE plpgsql;

-- Accrue Leave
CREATE OR REPLACE FUNCTION accrue_leave(
  p_employee_id UUID,
  p_leave_type_id UUID,
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_leave_type RECORD;
  v_accrual_rate NUMERIC;
  v_accrued_amount NUMERIC := 0;
  v_current_balance NUMERIC;
  v_max_accrual NUMERIC;
BEGIN
  -- Get leave type configuration
  SELECT * INTO v_leave_type
  FROM leave_types
  WHERE id = p_leave_type_id;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Calculate accrual based on method
  IF v_leave_type.accrual_method = 'fixed' THEN
    v_accrued_amount := COALESCE(v_leave_type.accrual_rate, 0);
  ELSIF v_leave_type.accrual_method = 'per_hour' THEN
    -- Would calculate based on hours worked
    v_accrued_amount := COALESCE(v_leave_type.accrual_rate, 0) * 40; -- Simplified
  ELSIF v_leave_type.accrual_method = 'per_month' THEN
    v_accrued_amount := COALESCE(v_leave_type.accrual_rate, 0);
  END IF;
  
  -- Get current balance
  v_current_balance := calculate_leave_balance(p_employee_id, p_leave_type_id, p_period_end);
  
  -- Check max accrual
  v_max_accrual := COALESCE(v_leave_type.max_accrual, 999999);
  IF v_current_balance + v_accrued_amount > v_max_accrual THEN
    v_accrued_amount := GREATEST(0, v_max_accrual - v_current_balance);
  END IF;
  
  -- Update or insert balance
  INSERT INTO leave_balances (employee_id, leave_type_id, current_balance, accrued, period_start, period_end)
  VALUES (p_employee_id, p_leave_type_id, v_current_balance + v_accrued_amount, v_accrued_amount, p_period_start, p_period_end)
  ON CONFLICT (employee_id, leave_type_id) 
  DO UPDATE SET
    current_balance = leave_balances.current_balance + v_accrued_amount,
    accrued = leave_balances.accrued + v_accrued_amount,
    last_accrual_date = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP;
  
  RETURN v_accrued_amount;
END;
$$ LANGUAGE plpgsql;

-- Validate Leave Request
CREATE OR REPLACE FUNCTION validate_leave_request(
  p_employee_id UUID,
  p_leave_type_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  v_balance NUMERIC;
  v_duration NUMERIC;
  v_result JSONB;
  v_leave_type RECORD;
BEGIN
  -- Get leave type
  SELECT * INTO v_leave_type FROM leave_types WHERE id = p_leave_type_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Leave type not found');
  END IF;
  
  -- Calculate duration
  v_duration := EXTRACT(EPOCH FROM (p_end_date - p_start_date)) / 3600; -- Hours
  
  -- Check balance
  v_balance := calculate_leave_balance(p_employee_id, p_leave_type_id, p_start_date);
  
  IF v_balance < v_duration THEN
    RETURN jsonb_build_object('valid', false, 'reason', 'Insufficient leave balance', 'balance', v_balance, 'requested', v_duration);
  END IF;
  
  -- Check advance notice if required
  IF v_leave_type.advance_notice_days IS NOT NULL THEN
    IF p_start_date < CURRENT_TIMESTAMP + (v_leave_type.advance_notice_days || ' days')::INTERVAL THEN
      RETURN jsonb_build_object('valid', false, 'reason', 'Insufficient advance notice');
    END IF;
  END IF;
  
  RETURN jsonb_build_object('valid', true, 'balance', v_balance, 'requested', v_duration);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ATTENDANCE FUNCTIONS
-- ============================================

-- Calculate Hours Worked
CREATE OR REPLACE FUNCTION calculate_hours_worked(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_total_hours NUMERIC;
BEGIN
  SELECT COALESCE(SUM(duration), 0)
  INTO v_total_hours
  FROM attendance_records
  WHERE (employee_id = p_employee_id OR contractor_id = p_contractor_id)
    AND date >= p_start_date
    AND date < p_end_date
    AND clock_in_time IS NOT NULL
    AND clock_out_time IS NOT NULL;
  
  RETURN COALESCE(v_total_hours, 0);
END;
$$ LANGUAGE plpgsql;

-- Calculate Overtime
CREATE OR REPLACE FUNCTION calculate_overtime(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_pay_period_start TIMESTAMP WITH TIME ZONE,
  p_pay_period_end TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_total_hours NUMERIC;
  v_overtime_threshold NUMERIC := 40;
  v_overtime_hours NUMERIC;
BEGIN
  -- Get overtime threshold from employee record
  IF p_employee_id IS NOT NULL THEN
    SELECT COALESCE(overtime_threshold, 40) INTO v_overtime_threshold
    FROM employees
    WHERE id = p_employee_id;
  END IF;
  
  -- Calculate total hours
  v_total_hours := calculate_hours_worked(p_employee_id, p_contractor_id, p_pay_period_start, p_pay_period_end);
  
  -- Calculate overtime
  v_overtime_hours := GREATEST(0, v_total_hours - v_overtime_threshold);
  
  RETURN v_overtime_hours;
END;
$$ LANGUAGE plpgsql;

-- Generate Time Card
CREATE OR REPLACE FUNCTION generate_time_card(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_pay_period_start TIMESTAMP WITH TIME ZONE,
  p_pay_period_end TIMESTAMP WITH TIME ZONE,
  p_pay_frequency TEXT
) RETURNS UUID AS $$
DECLARE
  v_time_card_id UUID;
  v_total_hours NUMERIC;
  v_regular_hours NUMERIC;
  v_overtime_hours NUMERIC;
  v_overtime_threshold NUMERIC := 40;
BEGIN
  -- Calculate hours
  v_total_hours := calculate_hours_worked(p_employee_id, p_contractor_id, p_pay_period_start, p_pay_period_end);
  
  IF p_employee_id IS NOT NULL THEN
    SELECT COALESCE(overtime_threshold, 40) INTO v_overtime_threshold
    FROM employees
    WHERE id = p_employee_id;
  END IF;
  
  v_regular_hours := LEAST(v_total_hours, v_overtime_threshold);
  v_overtime_hours := GREATEST(0, v_total_hours - v_overtime_threshold);
  
  -- Create time card
  INSERT INTO time_cards (
    employee_id, contractor_id, organization_id,
    pay_period_start, pay_period_end, pay_frequency,
    total_hours, regular_hours, overtime_hours,
    status
  )
  SELECT 
    p_employee_id, p_contractor_id, 
    CASE 
      WHEN p_employee_id IS NOT NULL THEN (SELECT organization_id FROM employees WHERE id = p_employee_id)
      WHEN p_contractor_id IS NOT NULL THEN (SELECT organization_id FROM hr_contractors WHERE id = p_contractor_id)
    END,
    p_pay_period_start, p_pay_period_end, p_pay_frequency,
    v_total_hours, v_regular_hours, v_overtime_hours,
    'draft'
  RETURNING id INTO v_time_card_id;
  
  RETURN v_time_card_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TIME TRACKING FUNCTIONS
-- ============================================

-- Aggregate Time Entries
CREATE OR REPLACE FUNCTION aggregate_time_entries(
  p_employee_id UUID,
  p_contractor_id UUID,
  p_start_date TIMESTAMP WITH TIME ZONE,
  p_end_date TIMESTAMP WITH TIME ZONE
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_hours', COALESCE(SUM(duration), 0),
    'billable_hours', COALESCE(SUM(CASE WHEN is_billable THEN duration ELSE 0 END), 0),
    'total_amount', COALESCE(SUM(total_amount), 0),
    'entry_count', COUNT(*)
  )
  INTO v_result
  FROM time_entries
  WHERE (employee_id = p_employee_id OR contractor_id = p_contractor_id)
    AND start_time >= p_start_date
    AND start_time < p_end_date
    AND status = 'completed';
  
  RETURN COALESCE(v_result, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql;

-- Calculate Billable Hours
CREATE OR REPLACE FUNCTION calculate_billable_hours(
  p_contractor_id UUID,
  p_project_id UUID,
  p_period_start TIMESTAMP WITH TIME ZONE,
  p_period_end TIMESTAMP WITH TIME ZONE
) RETURNS NUMERIC AS $$
DECLARE
  v_billable_hours NUMERIC;
BEGIN
  SELECT COALESCE(SUM(duration), 0)
  INTO v_billable_hours
  FROM time_entries
  WHERE contractor_id = p_contractor_id
    AND (p_project_id IS NULL OR project_id = p_project_id)
    AND start_time >= p_period_start
    AND start_time < p_period_end
    AND is_billable = true
    AND status = 'completed';
  
  RETURN COALESCE(v_billable_hours, 0);
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON FUNCTION calculate_gross_pay IS 'Calculates gross pay for employee or contractor based on hours worked or salary';
COMMENT ON FUNCTION calculate_taxes IS 'Calculates taxes based on gross pay and tax configuration';
COMMENT ON FUNCTION calculate_deductions IS 'Calculates all deductions for an employee or contractor';
COMMENT ON FUNCTION calculate_net_pay IS 'Calculates net pay after taxes and deductions';
COMMENT ON FUNCTION calculate_leave_balance IS 'Gets current leave balance for an employee';
COMMENT ON FUNCTION accrue_leave IS 'Accrues leave for an employee based on leave type configuration';
COMMENT ON FUNCTION validate_leave_request IS 'Validates a leave request against available balance and rules';
COMMENT ON FUNCTION calculate_hours_worked IS 'Calculates total hours worked from attendance records';
COMMENT ON FUNCTION calculate_overtime IS 'Calculates overtime hours for a pay period';
COMMENT ON FUNCTION generate_time_card IS 'Generates a time card for a pay period';
COMMENT ON FUNCTION aggregate_time_entries IS 'Aggregates time entries for reporting';
COMMENT ON FUNCTION calculate_billable_hours IS 'Calculates billable hours for a contractor';

