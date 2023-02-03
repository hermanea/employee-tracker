INSERT INTO department(name)
VALUES
    ('Operations'), 
    ('Research'),;
    
INSERT INTO role(title, salary, department_id )
VALUES
    ('Commander', 200000, 1), 
    ('Flight Engineer', 165000, 1),
    ('Science Office', 165000, 2), 
    ('Computer Scientist', 135000, 1),
    ('Biologist',135000, 2),
    ('Systems Engineer',135000, 2);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES
    ('Edward', 'Baldwin', 1, NULL), 
    ('Danielle', 'Poole', 2, NULL),
    ('Aleida', 'Rosales', 3, 1), 
    ('Kelly', 'Baldwin', 5, 2),
    ('Ellen', 'Waverly', 6, 3),
    ('Molly', 'Cobb', 6, 2);