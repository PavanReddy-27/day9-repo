import 'dotenv/config';

import { faker } from '@faker-js/faker';
import connectDB from './config/db';

import Company from './models/Company';
import Location from './models/Location';
import Department from './models/Department';
import Team from './models/Team';
import Employee from './models/Employee';
import User from './models/User';

const seedDB = async () => {
  try {
    const isReset = process.argv.includes('--reset');
    await connectDB();
    
    // Set deterministic seed
    faker.seed(123);

    if (isReset) {
      console.log('Resetting Database...');
      await Promise.all([
        Company.deleteMany({}),
        Location.deleteMany({}),
        Department.deleteMany({}),
        Team.deleteMany({}),
        Employee.deleteMany({}),
        User.deleteMany({})
      ]);
    }

    // 1. Create Company
    const company = await Company.create({ name: 'Stackly', code: 'STACKLY' });

    // 2. Create 5 Locations
    const locationsData = [
      { code: 'HYD', name: 'Hyderabad', count: 70 },
      { code: 'VSP', name: 'Visakhapatnam', count: 40 },
      { code: 'CHN', name: 'Chennai', count: 50 },
      { code: 'BLR', name: 'Bengaluru', count: 60 },
      { code: 'KOC', name: 'Kochi', count: 30 }
    ];
    
    const locations = {};
    for (const loc of locationsData) {
      locations[loc.code] = await Location.create({ company: company._id, name: loc.name, code: loc.code });
    }

    // 3. Create Departments
    const depts = ['Engineering', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Customer Support'];
    const departments = {};
    for (const d of depts) {
      const code = d.substring(0, 3).toUpperCase();
      departments[d] = await Department.create({ company: company._id, name: d, code });
    }

    // 4. Create Teams per Department
    const teamsByDept = {};
    for (const d of depts) {
      const t1 = await Team.create({ department: departments[d]._id, name: `${d} Alpha` });
      const t2 = await Team.create({ department: departments[d]._id, name: `${d} Beta` });
      teamsByDept[d] = [t1, t2];
    }

    // 5. Generate Employees and their corresponding Logins
    const employees = [];
    const users = [];
    let employeeCounter = 1;
    const systemRoles = ['Admin', 'HR', 'Manager', 'Team Lead', 'Employee'];

    for (const loc of locationsData) {
      for (let i = 0; i < loc.count; i++) {
        const deptName = faker.helpers.arrayElement(depts);
        const team = faker.helpers.arrayElement(teamsByDept[deptName]);
        
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
        
        // Distribute roles: mostly Employees, some Team Leads, fewer Managers/HR/Admins
        let role = 'Employee';
        const rand = Math.random();
        if (rand < 0.05) role = 'Admin';
        else if (rand < 0.15) role = 'HR';
        else if (rand < 0.3) role = 'Manager';
        else if (rand < 0.5) role = 'Team Lead';

        const employeeId = `EMP${String(employeeCounter++).padStart(4, '0')}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'thestackly.com' }).toLowerCase();

        employees.push({
          employeeId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          phone: faker.phone.number(),
          avatar: faker.image.avatar(),
          
          company: company._id,
          location: locations[loc.code]._id,
          department: departments[deptName]._id,
          team: team._id,
          
          role, // Assigning one of the 5 system roles
          designation: faker.person.jobTitle(), // Keeping job title as designation
          employmentType: faker.helpers.arrayElement(['Permanent', 'Contract', 'Intern', 'Consultant']),
          status: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Inactive', 'On Leave']),
          risk: faker.helpers.arrayElement(['Low', 'Low', 'Medium', 'High', 'Critical']),
          
          joiningDate: faker.date.past({ years: 5 }),
          gender,
          age: faker.number.int({ min: 22, max: 60 }),
          
          salary: faker.number.int({ min: 40000, max: 150000 }),
          bonus: faker.number.int({ min: 1000, max: 20000 }),
          experience: faker.number.int({ min: 0, max: 20 }),
          
          performanceScore: faker.number.int({ min: 50, max: 100 }),
          engagementScore: faker.number.int({ min: 50, max: 100 }),
          attendancePercentage: faker.number.int({ min: 70, max: 100 }),
          trainingCompletion: faker.number.int({ min: 0, max: 100 }),
          skillCoverage: faker.number.int({ min: 0, max: 100 }),
        });

        // Generate corresponding User login account
        users.push({
          employeeId,
          email,
          password: 'Password123!',
          role,
          companyId: company._id
        });
      }
    }

    // Batch insert employees and users
    await Employee.insertMany(employees);
    
    // We cannot use insertMany for users without hashing passwords first, but Mongoose pre-save middleware (which hashes passwords) 
    // does not run on insertMany unless configured carefully. So we will use create in a loop (or just Promise.all).
    console.log('Generating 250 secure user logins (this may take a moment due to password hashing)...');
    
    // To speed it up slightly, chunk the user creation
    const chunkSize = 25;
    for (let i = 0; i < users.length; i += chunkSize) {
      const chunk = users.slice(i, i + chunkSize);
      await Promise.all(chunk.map(u => User.create(u)));
    }

    console.log(`✅ Successfully seeded 1 Company, 5 Locations, ${depts.length} Departments, 250 Employees, and 250 User accounts!`);
    console.log('✅ Every employee can now log in using their generated email and "Password123!"');
    console.log('Seeding Complete! You may now exit.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
