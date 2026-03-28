import dbConnect from '../lib/db/mongodb';
import User from '../lib/db/models/User';
import { hashPassword } from '../lib/utils/password';

async function createAdmin() {
  try {
    await dbConnect();

    const adminEmail = 'admin@admin.com';
    const adminPassword = 'admin123';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const hashedPassword = await hashPassword(adminPassword);

    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
