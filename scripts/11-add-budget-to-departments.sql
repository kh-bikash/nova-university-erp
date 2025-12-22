-- Add budget column to departments
ALTER TABLE departments 
ADD COLUMN budget DECIMAL(15, 2) DEFAULT 0;
