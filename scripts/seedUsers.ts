import bcrypt from 'bcryptjs';
import { connectDB, disconnectDB } from '../src/config/db';
import { User } from '../src/models';

const seedUsers = async () => {
  const users = [
    {
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
      role: 'user' as const,
    },
    {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin' as const,
    },
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      await User.create({ name: u.name, email: u.email, passwordHash, role: u.role });
      console.log(`Created user: ${u.email}`);
    } else {
      console.log(`User already exists: ${u.email}`);
    }
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedUsers();
    console.log('User seeding completed!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

main();
