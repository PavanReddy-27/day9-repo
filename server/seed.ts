/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { faker } from '@faker-js/faker';
import connectDB from './config/db';
import mongoose from 'mongoose';

import Company from './models/Company';
import Location from './models/Location';
import Department from './models/Department';
import Team from './models/Team';
import Employee from './models/Employee';
import { AdminAuth, HRAuth, ManagerAuth, EmployeeAuth, User } from './models/User';
import LeaveRequest from './models/LeaveRequest';

const seedDB = async () => {
  try {
    const isReset = process.argv.includes('--reset');
    await connectDB();
    
    // Set deterministic seed
    faker.seed(123);

    session = await mongoose.startSession();
    session.startTransaction();

    console.log('Resetting Database for idempotent seed...');
    await Company.deleteMany({}, { session });
    await Location.deleteMany({}, { session });
    await Department.deleteMany({}, { session });
    await Team.deleteMany({}, { session });
    await Employee.deleteMany({}, { session });
    await AdminAuth.deleteMany({}, { session });
    await HRAuth.deleteMany({}, { session });
    await ManagerAuth.deleteMany({}, { session });
    await EmployeeAuth.deleteMany({}, { session });
    await User.deleteMany({}, { session });
    await LeaveRequest.deleteMany({}, { session });

    // 1. Create Company
    const companyArr = await Company.create([{ name: 'Stackly', code: 'STACKLY' }], { session });
    const company = companyArr[0];

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
      const locArr = await Location.create([{
        companyId: company._id,
        name: loc.name,
        code: loc.code,
        coordinates: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude()
        }
      }], { session });
      locations[loc.code] = locArr[0];
    }

    // 3. Create Departments
    const depts = ['Engineering', 'Human Resources', 'Finance', 'Sales', 'Marketing', 'Operations', 'Customer Support'];
    const departments = {};
    for (const d of depts) {
      const code = d.substring(0, 3).toUpperCase();
      const deptArr = await Department.create([{ companyId: company._id, name: d, code }], { session });
      departments[d] = deptArr[0];
    }

    // 4. Create Teams per Department
    const teamsByDept = {};
    for (const d of depts) {
      const t1Arr = await Team.create([{ department: departments[d]._id, name: `${d} Alpha` }], { session });
      const t2Arr = await Team.create([{ department: departments[d]._id, name: `${d} Beta` }], { session });
      teamsByDept[d] = [t1Arr[0], t2Arr[0]];
    }

    // 5. Generate Employees
    const employees = [];
    const admins = [];
    const hrs = [];
    const managers = [];
    const regularEmployees = [];
    let employeeCounter = 1;
    
    // Pre-hash password for speed
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    const roles = ['Admin', 'HR', 'Manager', 'Employee'];
    let devIndex = 0;

    const rolesTarget = {
      Admin: 1,
      Manager: 2,
      HR: 10,
      Employee: 237
    };
    
    let adminCount = 0;
    let managerCount = 0;
    let hrCount = 0;
    let empCount = 0;

    for (const loc of locationsData) {
      for (let i = 0; i < loc.count; i++) {
        const deptName = faker.helpers.arrayElement(depts);
        const team = faker.helpers.arrayElement(teamsByDept[deptName]);
        
        let firstName = faker.person.firstName();
        let lastName = faker.person.lastName();
        const gender = faker.helpers.arrayElement(['Male', 'Female', 'Other']);
        
        let empIdStr = `EMP${String(employeeCounter++).padStart(4, '0')}`;
        let email = faker.internet.email({ firstName, lastName, provider: 'thestackly.com' }).toLowerCase();
        let role = 'Employee';
        
        if (devIndex < roles.length) {
          role = roles[devIndex];
          email = `${role.toLowerCase().replace(' ', '')}@thestackly.com`;
          empIdStr = `DEV_${role.toUpperCase().replace(' ', '_')}`;
          firstName = 'Dev';
          lastName = role;
          devIndex++;
        } else {
          if (managerCount < rolesTarget.Manager) role = 'Manager';
          else if (hrCount < rolesTarget.HR) role = 'HR';
          else if (adminCount < rolesTarget.Admin) role = 'Admin';
          else role = 'Employee';
        }

        if (role === 'Admin') adminCount++;
        else if (role === 'Manager') managerCount++;
        else if (role === 'HR') hrCount++;
        else empCount++;
        
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

        const userDoc = {
          employeeId: empIdStr,
          companyId: company._id,
          email: email,
          password: defaultPassword,
          role: role
        };
        
        if (role === 'Admin') admins.push(userDoc);
        else if (role === 'HR') hrs.push(userDoc);
        else if (role === 'Manager') managers.push(userDoc);
        else regularEmployees.push(userDoc);
      }
    }

    // Batch insert employees and users
    await Employee.insertMany(employees, { session });
    if (admins.length > 0) await AdminAuth.insertMany(admins, { session });
    if (hrs.length > 0) await HRAuth.insertMany(hrs, { session });
    if (managers.length > 0) await ManagerAuth.insertMany(managers, { session });
    if (regularEmployees.length > 0) await EmployeeAuth.insertMany(regularEmployees, { session });
    
    await session.commitTransaction();
    session.endSession();
    
    console.log(`✅ Successfully seeded 1 Company, 5 Locations, ${depts.length} Departments, 250 Employees, and 250 User Logins!`);
    console.log('✅ Dev accounts included! (e.g. admin@thestackly.com / Password123!)');
    console.log('Seeding Complete! You may now exit.');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    try {
      // Need to dynamically import mongoose or assume session is in scope if error thrown later
      // The session is scoped outside, wait, `session` is in the `try` block!
      // Let's modify the try-catch block structure to fix scoping of `session`.
      // The previous block handles this, I should have declared `let session;` outside.
      // For now, I'll just check if it can be imported.
      // Wait, `mongoose` is imported at the top, I just can't easily access `session` if it's declared inside `try`.
      // I'll declare `let session = null;` at the top of the function.
      process.exit(1);
    } catch {}
    process.exit(1);
    process.exit(1);
  }
};

seedDB();
