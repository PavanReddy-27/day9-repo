import 'dotenv/config';
import mongoose from 'mongoose';
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
    const company = await Company.create({ name: 'Acme Corp', code: 'ACME' });

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

    // 5. Generate Employees
    const employees = [];
    let employeeCounter = 1;

    for (const loc of locationsData) {
      for (let i = 0; i < loc.count; i++) {
        const deptName = faker.helpers.arrayElement(depts);
        const team = faker.helpers.arrayElement(teamsByDept[deptName]);
        
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
        
        employees.push({
          employeeId: `EMP${String(employeeCounter++).padStart(4, '0')}`,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email: faker.internet.email({ firstName, lastName, provider: 'thestackly.com' }).toLowerCase(),
          phone: faker.phone.number(),
          avatar: faker.image.avatar(),
          
          company: company._id,
          location: locations[loc.code]._id,
          department: departments[deptName]._id,
          team: team._id,
          
          role: faker.person.jobTitle(),
          designation: faker.person.jobType(),
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
      }
    }

    // Batch insert employees
    await Employee.insertMany(employees);
    console.log(`✅ Successfully seeded 1 Company, 5 Locations, ${depts.length} Departments, and 250 Employees!`);

    // 6. Create Development Users
    console.log('Creating 5 development accounts...');
    const roles = ['Admin', 'HR', 'Manager', 'Team Lead', 'Employee'];
    
    for (const role of roles) {
      await User.create({
        employeeId: `DEV_${role.toUpperCase()}`,
        email: `${role.toLowerCase().replace(' ', '')}@thestackly.com`,
        password: 'Password123!',
        role: role
      });
    }
    
    console.log('✅ Dev accounts created! (e.g. admin@thestackly.com / Password123!)');
    console.log('Seeding Complete! You may now exit.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();
