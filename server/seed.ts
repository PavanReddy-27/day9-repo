import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import connectDB from './config/db';

import Company from './models/Company';
import Location from './models/Location';
import Department from './models/Department';
import Team from './models/Team';
import Employee from './models/Employee';
import { User } from './models/User';
import LeaveRequest from './models/LeaveRequest';

const seedDB = async () => {
  try {
    const isReset = process.argv.includes('--reset');
    await connectDB();
    
    // Set deterministic seed
    faker.seed(123);

    if (isReset) {
      console.log('Resetting Database...');
        await Company.deleteMany({});
        await Location.deleteMany({});
        await Department.deleteMany({});
        await Team.deleteMany({});
        await Employee.deleteMany({});
        await User.deleteMany({});
        await LeaveRequest.deleteMany({});
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
    
    const locations: Record<string, any> = {};
    for (const loc of locationsData) {
      locations[loc.code] = await Location.create({
        companyId: company._id,
        name: loc.name,
        code: loc.code,
        coordinates: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude()
        }
      });
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
    const users = [];
    let employeeCounter = 1;
    
    // Pre-hash password for speed
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    for (const loc of locationsData) {
      for (let i = 0; i < loc.count; i++) {
        const deptName = faker.helpers.arrayElement(depts);
        const team = faker.helpers.arrayElement(teamsByDept[deptName]);
        
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
        
        const empIdStr = `EMP${String(employeeCounter++).padStart(4, '0')}`;
        const email = faker.internet.email({ firstName, lastName, provider: 'thestackly.com' }).toLowerCase();
        const role = faker.helpers.arrayElement(['Admin', 'HR', 'Manager', 'Employee']);
        
        employees.push({
          employeeId: empIdStr,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`,
          email,
          phone: faker.phone.number(),
          avatar: faker.image.avatar(),
          
          companyId: company._id,
          locationId: locations[loc.code]._id,
          departmentId: departments[deptName]._id,
          teamId: team._id,
          
          role,
          designation: faker.person.jobType(),
          employmentStatus: faker.helpers.arrayElement(['Active', 'Active', 'Active', 'Inactive', 'On Leave']),
          riskLevel: faker.helpers.arrayElement(['Low', 'Low', 'Medium', 'High', 'Critical']),
          
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

        users.push({
          employeeId: empIdStr,
          companyId: company._id,
          email: email,
          password: defaultPassword,
          role: role
        });
      }
    }

    // Batch insert employees and users
    await Employee.insertMany(employees);
    await User.insertMany(users);
    console.log(`✅ Successfully seeded 1 Company, 5 Locations, ${depts.length} Departments, 250 Employees, and 250 User Logins!`);

    // 6. Create Development Users
    console.log('Creating 5 development accounts...');
    const roles = ['Admin', 'HR', 'Manager', 'Employee'];
    
    // Pick the first generated location and department
    const devLocation = Object.values(locations)[0];
    const devDepartment = Object.values(departments)[0];
    
    for (const role of roles) {
      const empIdStr = `DEV_${role.toUpperCase().replace(' ', '_')}`;
      
      const emp = await Employee.create({
        employeeId: empIdStr,
        companyId: company._id,
        locationId: devLocation._id,
        departmentId: devDepartment._id,
        email: `${role.toLowerCase().replace(' ', '')}@thestackly.com`,
        firstName: 'Dev',
        lastName: role,
        fullName: `Dev ${role}`,
        role: role,
        joiningDate: new Date(),
      });

      await User.create({
        employeeId: empIdStr,
        companyId: company._id,
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
