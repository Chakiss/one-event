import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);

  // ตรวจสอบว่ามี admin user อยู่แล้วหรือไม่
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@oneevent.com' },
  });

  if (!existingAdmin) {
    // สร้าง admin user
    const adminUser = userRepository.create({
      email: 'admin@oneevent.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
    });

    await userRepository.save(adminUser);
    console.log('✅ Admin user created: admin@oneevent.com / admin123');
  } else {
    console.log('ℹ️ Admin user already exists');
  }

  // ตรวจสอบว่ามี guest user อยู่แล้วหรือไม่
  const existingGuest = await userRepository.findOne({
    where: { email: 'guest@oneevent.com' },
  });

  if (!existingGuest) {
    // สร้าง guest user
    const guestUser = userRepository.create({
      email: 'guest@oneevent.com',
      password: await bcrypt.hash('guest123', 10),
      role: 'guest',
    });

    await userRepository.save(guestUser);
    console.log('✅ Guest user created: guest@oneevent.com / guest123');
  } else {
    console.log('ℹ️ Guest user already exists');
  }
}
